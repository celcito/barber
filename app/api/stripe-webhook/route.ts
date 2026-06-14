import { NextResponse } from "next/server";

// TODO: Reativar Stripe depois
// import Stripe from "stripe";
// import { stripe } from "@/lib/stripe";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe temporariamente desabilitado" },
    { status: 501 }
  );
}
