import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { emitirNfse } from "@/lib/nfe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const salaoId = session.metadata?.salao_id;

      if (salaoId) {
        await supabase
          .from("saloes")
          .update({
            ativo: true,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", salaoId);

        if (session.amount_total && session.amount_total > 0) {
          await gerarNotaFiscal(supabase, salaoId, {
            amount: session.amount_total / 100,
            customerName: session.customer_details?.name ?? undefined,
            customerEmail: session.customer_details?.email ?? undefined,
            description: "Assinatura AgendaFácil",
          });
        }
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice & { subscription: string };
      const subscriptionId = invoice.subscription;

      const { data: salao } = await supabase
        .from("saloes")
        .select("id, nome")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (salao && invoice.amount_paid && invoice.amount_paid > 0) {
        await gerarNotaFiscal(supabase, salao.id, {
          amount: invoice.amount_paid / 100,
          customerName: salao.nome,
          customerEmail: invoice.customer_email ?? undefined,
          description: `Assinatura AgendaFácil - ${invoice.number ?? ""}`,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const { data: salao } = await supabase
        .from("saloes")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (salao) {
        await supabase
          .from("saloes")
          .update({ ativo: false, stripe_subscription_id: null })
          .eq("id", salao.id);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      if (sub.status === "active" || sub.status === "trialing") {
        const { data: salao } = await supabase
          .from("saloes")
          .select("id")
          .eq("stripe_customer_id", sub.customer as string)
          .single();

        if (salao) {
          await supabase
            .from("saloes")
            .update({ ativo: true, stripe_subscription_id: sub.id })
            .eq("id", salao.id);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function gerarNotaFiscal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  salaoId: string,
  params: {
    amount: number;
    customerName?: string;
    customerEmail?: string;
    description: string;
  },
) {
  if (
    !process.env.NFE_API_KEY ||
    !process.env.NFE_COMPANY_ID ||
    !process.env.NFE_CITY_SERVICE_CODE
  ) {
    console.warn("NFE.io não configurado — pulando emissão de nota fiscal");
    return;
  }

  try {
    const { data: salao } = await supabase
      .from("saloes")
      .select("nome, doc_fiscal, endereco")
      .eq("id", salaoId)
      .single();

    if (!salao) return;

    const nome = params.customerName || salao.nome;
    const doc = salao.doc_fiscal as
      | { tipo: "CPF" | "CNPJ"; numero: string }
      | null
      | undefined;

    const borrower = doc
      ? doc.tipo === "CNPJ"
        ? {
            type: "LegalEntity" as const,
            federalTaxNumber: Number(doc.numero.replace(/\D/g, "")),
            name: nome,
            email: params.customerEmail,
          }
        : {
            type: "NaturalPerson" as const,
            federalTaxNumber: Number(doc.numero.replace(/\D/g, "")),
            name: nome,
            email: params.customerEmail,
          }
      : undefined;

    if (!borrower) {
      console.warn(
        `Salão ${salaoId} sem doc_fiscal — pulando emissão NFS-e`,
      );
      return;
    }

    await emitirNfse({
      borrower,
      description: params.description,
      servicesAmount: params.amount,
    });

    console.log(`NFS-e emitida para salão ${salaoId} — R$ ${params.amount}`);
  } catch (error) {
    console.error("Erro ao emitir NFS-e:", error);
  }
}
