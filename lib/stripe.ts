import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY não configurada");
}

export const stripe = new Stripe(secretKey, {
  typescript: true,
});

const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
if (!priceId) {
  throw new Error("NEXT_PUBLIC_STRIPE_PRICE_ID não configurada");
}

export const PRICE_ID = priceId;
export const TRIAL_DAYS = 30;
