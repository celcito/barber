type AuditAction =
  | "agendamento.criado"
  | "agendamento.cancelado"
  | "horario_excessao.criado"
  | "horario_excessao.deletado"
  | "upload.avatar"
  | "auth.login"
  | "auth.logout"
  | "auth.signup";

export function auditLog(action: AuditAction, metadata?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    ...(metadata ? { metadata } : {}),
  };
  console.log(JSON.stringify({ type: "audit", ...entry }));
}
