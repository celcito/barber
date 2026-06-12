import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  duracao_min: z.coerce.number().int().min(5, "Mínimo 5 minutos").max(480, "Máximo 8 horas"),
  preco: z.coerce.number().min(0, "Preço não pode ser negativo"),
});

export type ServicoFormData = z.infer<typeof servicoSchema>;
