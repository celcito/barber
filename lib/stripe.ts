import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
export const TRIAL_DAYS = 30;
