import Link from "next/link";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #0b2c75 0%, #03123f 45%, #020b2d 100%)",
    color: "#f5f7ff",
    padding: "48px 24px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  hero: {
    background: "rgba(25, 42, 92, 0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  title: {
    fontSize: "56px",
    lineHeight: 1.05,
    fontWeight: 800,
    margin: 0,
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "22px",
    lineHeight: 1.5,
    color: "#d7def7",
    margin: 0,
    marginBottom: "32px",
    maxWidth: "900px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "block",
    textDecoration: "none",
    background: "rgba(44, 60, 112, 0.88)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    color: "#f5f7ff",
    boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  cardText: {
    fontSize: "16px",
    lineHeight: 1.55,
    color: "#d7def7",
    marginBottom: "16px",
  },
  cardLink: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#9fc0ff",
  },
};

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <h1 style={styles.title}>Comanda AI</h1>
          <p style={styles.subtitle}>
            Protótipo inicial de sistema de comanda digital com agente de IA.
            Escolha uma área para navegar pelo fluxo principal do produto.
          </p>

          <div style={styles.grid}>
            <Link href="/cliente" style={styles.card}>
              <div style={styles.cardTitle}>Área do Cliente</div>
              <div style={styles.cardText}>
                Cardápio digital, pedido em linguagem natural e confirmação do
                pedido.
              </div>
              <div style={styles.cardLink}>Entrar no fluxo do cliente →</div>
            </Link>

            <Link href="/cozinha" style={styles.card}>
              <div style={styles.cardTitle}>Painel da Cozinha</div>
              <div style={styles.cardText}>
                Acompanhe os pedidos recebidos e atualize o status para preparo
                ou pronto.
              </div>
              <div style={styles.cardLink}>Ver pedidos em andamento →</div>
            </Link>

            <Link href="/admin" style={styles.card}>
              <div style={styles.cardTitle}>Painel Admin</div>
              <div style={styles.cardText}>
                Visual geral da operação, cardápio, pedidos registrados e
                faturamento.
              </div>
              <div style={styles.cardLink}>Abrir visão administrativa →</div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}