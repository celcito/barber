import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}[- ]\d{4,5}$/, "WhatsApp inválido (use (99) 99999-9999)"),
  email: z
    .string()
    .email("E-mail inválido")
    .max(150, "E-mail muito longo")
    .optional()
    .or(z.literal("")),
});

export const adminAgendamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}[- ]\d{4,5}$/, "WhatsApp inválido (use (99) 99999-9999)"),
  email: z
    .string()
    .email("E-mail inválido")
    .max(150, "E-mail muito longo")
    .optional()
    .or(z.literal("")),
});

export type AdminAgendamentoFormData = z.infer<typeof adminAgendamentoSchema>;
export type ClienteFormData = z.infer<typeof clienteSchema>;

export interface AgendaConfig {
  horarios: Record<string, { aberto: boolean; inicio: string; fim: string }>;
  intervalo: number;
}

export interface NotificacoesConfig {
  lembretes_ativos: boolean;
  lembretes_email_ativos?: boolean;
  intervalo_lembrete: number;
  template: string;
  notificar_dono: boolean;
}

export const DIAS_SEMANA = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo",
] as const;

export const DIAS_SEMANA_MAP: Record<string, number> = {
  "segunda-feira": 1,
  "terça-feira": 2,
  "quarta-feira": 3,
  "quinta-feira": 4,
  "sexta-feira": 5,
  "sábado": 6,
  "domingo": 0,
};
