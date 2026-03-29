import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Comanda AI</h1>
          <p className="page-subtitle">
            Protótipo inicial de sistema de comanda digital com agente de IA.
            Escolha uma área para navegar pelo fluxo principal do produto.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <Link href="/cliente" className="home-link-card" aria-label="Abrir área do cliente">
            <div>
              <h2 className="home-link-card-title">Área do Cliente</h2>
              <p className="home-link-card-text">
                Cardápio digital, pedido em linguagem natural e confirmação do pedido.
              </p>
            </div>
            <p className="home-link-card-footer">Entrar no fluxo do cliente →</p>
          </Link>

          <Link href="/cozinha" className="home-link-card" aria-label="Abrir painel da cozinha">
            <div>
              <h2 className="home-link-card-title">Painel da Cozinha</h2>
              <p className="home-link-card-text">
                Acompanhe os pedidos recebidos e atualize o status para preparo ou pronto.
              </p>
            </div>
            <p className="home-link-card-footer">Ver pedidos em andamento →</p>
          </Link>

          <Link href="/admin" className="home-link-card" aria-label="Abrir painel administrativo">
            <div>
              <h2 className="home-link-card-title">Painel Admin</h2>
              <p className="home-link-card-text">
                Visual geral da operação, cardápio, pedidos registrados e faturamento.
              </p>
            </div>
            <p className="home-link-card-footer">Abrir visão administrativa →</p>
          </Link>
        </section>
      </div>
    </main>
  );
}