import { NfeClient } from "nfe-io";

export const nfe = new NfeClient({
  apiKey: process.env.NFE_API_KEY!,
  environment: (process.env.NFE_ENVIRONMENT as "production" | "development") || "production",
});

export const NFE_COMPANY_ID = process.env.NFE_COMPANY_ID!;
export const NFE_CITY_SERVICE_CODE = process.env.NFE_CITY_SERVICE_CODE!;

export interface EmitirNfseParams {
  borrower:
    | {
        type: "LegalEntity";
        federalTaxNumber: number;
        name: string;
        email?: string;
        address?: {
          country: string;
          postalCode: string;
          street: string;
          number: string;
          complement?: string;
          neighborhood?: string;
          city: { code: string; name: string };
          state: string;
        };
      }
    | {
        type: "NaturalPerson";
        federalTaxNumber: number;
        name: string;
        email?: string;
        address?: {
          country: string;
          postalCode: string;
          street: string;
          number: string;
          complement?: string;
          neighborhood?: string;
          city: { code: string; name: string };
          state: string;
        };
      };
  description: string;
  servicesAmount: number;
}

export async function emitirNfse(params: EmitirNfseParams) {
  return nfe.serviceInvoices.createAndWait(NFE_COMPANY_ID, {
    cityServiceCode: NFE_CITY_SERVICE_CODE,
    description: params.description,
    servicesAmount: params.servicesAmount,
    borrower: params.borrower,
  });
}
