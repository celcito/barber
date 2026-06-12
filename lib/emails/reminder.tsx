import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface ReminderEmailProps {
  clienteNome: string;
  servicoNome: string;
  profissionalNome: string;
  data: string;
  horario: string;
  salaoNome: string;
}

const styles = {
  main: {
    backgroundColor: "#121414",
    fontFamily: "'Hanken Grotesk', Arial, sans-serif",
    padding: "40px 0",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: "#1a1c1e",
    borderRadius: "8px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0d0e0f",
    padding: "32px 40px 24px",
    textAlign: "center" as const,
  },
  headerTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#c5a059",
    margin: "0 0 4px",
    letterSpacing: "0.02em",
  },
  headerSub: {
    fontSize: "12px",
    color: "#9a8f80",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
  },
  body: {
    padding: "32px 40px",
  },
  greeting: {
    fontSize: "16px",
    color: "#e8e4df",
    margin: "0 0 20px",
    lineHeight: "1.5",
  },
  card: {
    backgroundColor: "#0d0e0f",
    borderRadius: "6px",
    padding: "24px",
    marginBottom: "24px",
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #2a2c2e",
  },
  cardLabel: {
    fontSize: "13px",
    color: "#9a8f80",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  cardValue: {
    fontSize: "14px",
    color: "#e8e4df",
    fontWeight: "600",
  },
  footer: {
    padding: "24px 40px 32px",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "12px",
    color: "#6b655c",
    margin: "0 0 4px",
    lineHeight: "1.6",
  },
};

export function ReminderEmail({
  clienteNome,
  servicoNome,
  profissionalNome,
  data,
  horario,
  salaoNome,
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.headerTitle}>{salaoNome}</Text>
            <Text style={styles.headerSub}>Lembrete de Agendamento</Text>
          </Section>

          <Section style={styles.body}>
            <Text style={styles.greeting}>Olá {clienteNome},</Text>
            <Text style={styles.greeting}>
              Passando para lembrar que você tem um horário marcado conosco:
            </Text>

            <Section style={styles.card}>
              <div style={styles.cardRow}>
                <Text style={styles.cardLabel}>Serviço</Text>
                <Text style={styles.cardValue}>{servicoNome}</Text>
              </div>
              <div style={styles.cardRow}>
                <Text style={styles.cardLabel}>Profissional</Text>
                <Text style={styles.cardValue}>{profissionalNome}</Text>
              </div>
              <div style={styles.cardRow}>
                <Text style={styles.cardLabel}>Data</Text>
                <Text style={styles.cardValue}>{data}</Text>
              </div>
              <div style={{ ...styles.cardRow, borderBottom: "none" }}>
                <Text style={styles.cardLabel}>Horário</Text>
                <Text style={styles.cardValue}>{horario}</Text>
              </div>
            </Section>

            <Text style={{ ...styles.greeting, fontSize: "14px", color: "#9a8f80" }}>
              Chegue no horário para aproveitar ao máximo seu atendimento.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#2a2c2e", margin: "0 40px" }} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>{salaoNome}</Text>
            <Text style={styles.footerText}>Esperamos por você!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
