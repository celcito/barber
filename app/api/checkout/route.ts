import { NextResponse } from "next/server";

// TODO: Reativar Stripe depois
// import { stripe, PRICE_ID, TRIAL_DAYS } from "@/lib/stripe";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe temporariamente desabilitado" },
    { status: 501 }
  );
}
