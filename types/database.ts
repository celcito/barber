export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      saloes: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          whatsapp: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          ativo: boolean;
          doc_fiscal: Json | null;
          endereco: Json | null;
          config: Json;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          whatsapp?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          ativo?: boolean;
          doc_fiscal?: Json | null;
          endereco?: Json | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          whatsapp?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          ativo?: boolean;
          doc_fiscal?: Json | null;
          endereco?: Json | null;
          config?: Json;
          criado_em?: string;
        };
      };
      profissionais: {
        Row: {
          id: string;
          salao_id: string;
          nome: string;
          ativo: boolean;
        };
        Insert: {
          id?: string;
          salao_id: string;
          nome: string;
          ativo?: boolean;
        };
        Update: {
          id?: string;
          salao_id?: string;
          nome?: string;
          ativo?: boolean;
        };
      };
      servicos: {
        Row: {
          id: string;
          salao_id: string;
          nome: string;
          duracao_min: number;
          preco: number;
        };
        Insert: {
          id?: string;
          salao_id: string;
          nome: string;
          duracao_min: number;
          preco: number;
        };
        Update: {
          id?: string;
          salao_id?: string;
          nome?: string;
          duracao_min?: number;
          preco?: number;
        };
      };
      horario_excessoes: {
        Row: {
          id: string;
          salao_id: string;
          data_inicio: string;
          data_fim: string;
          tipo: "bloqueado" | "aberto_excessao";
          descricao: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          salao_id: string;
          data_inicio: string;
          data_fim: string;
          tipo: "bloqueado" | "aberto_excessao";
          descricao?: string;
          criado_em?: string;
        };
        Update: {
          id?: string;
          salao_id?: string;
          data_inicio?: string;
          data_fim?: string;
          tipo?: "bloqueado" | "aberto_excessao";
          descricao?: string;
          criado_em?: string;
        };
      };
      agendamentos: {
        Row: {
          id: string;
          salao_id: string;
          profissional_id: string | null;
          servico_id: string;
          cliente_nome: string;
          cliente_whatsapp: string;
          inicio: string;
          fim: string;
          status: "confirmado" | "pendente" | "cancelado";
          lembrete_enviado: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          salao_id: string;
          profissional_id?: string | null;
          servico_id: string;
          cliente_nome: string;
          cliente_whatsapp: string;
          inicio: string;
          fim: string;
          status?: "confirmado" | "pendente" | "cancelado";
          lembrete_enviado?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          salao_id?: string;
          profissional_id?: string | null;
          servico_id?: string;
          cliente_nome?: string;
          cliente_whatsapp?: string;
          inicio?: string;
          fim?: string;
          status?: "confirmado" | "pendente" | "cancelado";
          lembrete_enviado?: boolean;
          criado_em?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      agendamento_status: "confirmado" | "pendente" | "cancelado";
    };
  };
}
