# Comanda Aí — demonstração pública

MVP independente em HTML, CSS e JavaScript. Cardápio com busca, carrinho, totais em centavos, confirmação, histórico local e cozinha com atualização sequencial de status. Produtos e preços fictícios.

Executar: `python3 -m http.server 8000 --directory docs`. Testar: `node --test docs/core.test.mjs` — quatro testes locais aprovados em 30/10/2026.

Carrinho e pedidos persistem somente no localStorage deste navegador. Não há sincronização multiusuário, pagamentos ou entrega. Não informe dados pessoais. Limpar os dados do site remove o histórico. Falhas de armazenamento são informadas. Não acessa APIs ou o banco do sistema original. Nenhuma dependência ou serviço pago.

A aplicação fullstack original permanece separada e protegida. O PR #1 continua aberto, sem merge automático. A homologação pública será registrada após a implantação.
