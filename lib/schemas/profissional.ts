import { z } from "zod";

export const profissionalSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  ativo: z.boolean().default(true),
});

export type ProfissionalFormData = z.infer<typeof profissionalSchema>;
