import { z } from "zod";

export const salaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  whatsapp: z.string().trim().max(30).or(z.literal("")),
});

export type SalaoFormData = z.infer<typeof salaoSchema>;

export const DIAS_SEMANA = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo",
] as const;
