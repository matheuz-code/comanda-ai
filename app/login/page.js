"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao realizar login.");
      }

      const destino = data?.redirectTo || "/admin";

      window.location.assign(destino);
    } catch (error) {
      console.error("Erro no login:", error);
      alert(error.message || "Erro ao realizar login.");
      setLoading(false);
    }
  }

  return (
    <main className="container-shell">
      <section className="glass-card p-10 md:p-12 max-w-5xl mx-auto">
        <div className="badge-pill mb-6">Acesso restrito</div>

        <h1 className="section-title-lg mb-4">Entrar no sistema</h1>

        <p className="section-subtitle mb-8">
          Faça login para acessar o painel administrativo ou operacional.
        </p>

        <form onSubmit={handleLogin} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label-text">E-mail</label>
            <input
              type="email"
              className="ui-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com"
              required
            />
          </div>

          <div>
            <label className="label-text">Senha</label>
            <input
              type="password"
              className="ui-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              Voltar para home
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
