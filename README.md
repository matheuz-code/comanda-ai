# Comanda Aí

Projeto independente de pedidos para restaurantes, distinto do Dark Chicken SRS. Next.js 16, React 19, JavaScript, PostgreSQL/Neon e autenticação por cookie assinado. **Estado: demonstração pública independente disponível; sistema fullstack original em revisão de segurança no PR #1, sem merge.**

## Demonstração pública, sem login de hospedagem

https://matheuz-code.github.io/comanda-ai/

MVP independente em `docs/`, feito em HTML, CSS e JavaScript: cardápio com busca e filtro, carrinho, quantidades, remoção, totais em centavos, confirmação de pedido, histórico e cozinha com atualização de status. Produtos, preços e mesas são fictícios. Carrinho e pedidos ficam no localStorage do próprio navegador e sobrevivem à recarga; não há sincronização entre dispositivos, pagamento, entrega ou acesso ao banco original. Não informe dados pessoais.

O GitHub Pages publica apenas `docs/` da branch `portfolio/security-review`, preservando `main` e o PR #1 sem merge. O preview fullstack na Vercel continua protegido. A demonstração pública não desativa autenticação nem homologa o backend original.

Testar demo: `node --test docs/core.test.mjs` — 4 testes aprovados. Executar local: `python3 -m http.server 8000 --directory docs`. Em 30/10/2026, foram testados na URL pública: busca sem resultado, quantidades, remoção, mesa inválida, pedido confirmado e status de cozinha preservado após recarga. Verificação responsiva será registrada separadamente.

![Pedido fictício na cozinha demonstrativa](docs/demo-preview.jpg)

## Fluxos implementados no sistema fullstack

Cardápio público, seleção de produtos e mesa, interpretação determinística de texto, pedidos persistidos, telas de cozinha e administração e login de equipe. A interpretação atual não exige IA paga nem chave de API. Não há pagamento real.

## Preparação local

```bash
npm ci
# Defina DATABASE_URL e SESSION_SECRET no ambiente local.
npm run dev
```

`DATABASE_URL` deve apontar para um banco de desenvolvimento separado. `SESSION_SECRET` precisa ter pelo menos 32 caracteres aleatórios. Nunca envie arquivos `.env` ao GitHub. As tabelas legadas precisam ser provisionadas por um processo local autorizado; ainda falta uma migração versionada e um script seguro de primeiro administrador.

## Revisão de segurança

As rotas HTTP legadas de criação/redefinição de contas foram desativadas com status 410; não redefinem mais senhas. Cookies de sessão usam Secure em produção. A chave de assinatura não tem fallback público. Leitura de pedidos e alteração de status exigem equipe autenticada; o total de um novo pedido é calculado a partir do catálogo do servidor, ignorando valores enviados pelo navegador. Mensagens HTTP não expõem detalhes internos do banco.

## Verificação

```bash
npm test
npm run lint
npm run build
```

Revisão em 29/10/2026: **5 testes aprovados**, lint sem erros e build de produção aprovado. **6 verificações HTTP locais aprovadas**: login 200, duas rotas de bootstrap/reset 410, leitura e alteração de pedidos sem autenticação 401 e cozinha redirecionando ao login com 307. Auditoria das dependências de produção: **zero vulnerabilidades conhecidas**. Os testes de cálculo cobrem adulteração de preços, produtos inexistentes/inativos, quantidades inválidas e repetidas e pedidos vazios. Nenhum banco real foi acessado; build e verificações sem autenticação não comprovam integração com PostgreSQL ou login em produção.

## Limitações

Não foi usado o arquivo `.env.local` do ZIP nem copiado o arquivo de pedidos dele. Os dados rastreados do repositório foram preservados. Não houve acesso ao banco real nem migração. Ainda faltam homologação completa com PostgreSQL, provisionamento administrativo, limite de tentativas de login, proteção contra abuso de criação pública de pedidos e implantação validada. O identificador de pedido baseado no horário precisa evoluir para evitar colisões concorrentes. A revisão não deve ser apresentada como produto final.

A versão anterior permanece no histórico Git e o ZIP original foi preservado. Nenhum recurso pago é obrigatório; não foram contratados serviços, créditos ou planos.
