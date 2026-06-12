import { NextResponse } from "next/server";
import { stripe, PRICE_ID, TRIAL_DAYS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: salao } = await supabase
      .from("saloes")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = salao?.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { salao_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("saloes")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: { salao_id: user.id },
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { salao_id: user.id },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/assinar?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout] Error:", err);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout" },
      { status: 500 }
    );
  }
}
