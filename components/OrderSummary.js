"use client";

export default function OrderSummary({
  items,
  total,
  onConfirm,
  onClear,
  onRemoveItem,
  disabled = false,
}) {
  return (
    <aside className="glass-card summary-card">
      <div className="section-block">
        <div>
          <h2 className="section-title">Resumo do pedido</h2>
          <p className="section-subtitle">
            Confira os itens antes de enviar para a cozinha.
          </p>
        </div>

        <div className="muted-divider" />
      </div>

      <div className="summary-list">
        {items.length === 0 ? (
          <div className="summary-empty">
            Nenhum item no pedido ainda. Você pode adicionar itens pelo cardápio ou escrever o pedido no campo de interpretação.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="summary-item">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="summary-item-title">
                    {item.quantity}x {item.name}
                  </p>

                  {item.notes ? (
                    <p className="summary-item-note">{item.notes}</p>
                  ) : (
                    <p className="summary-item-note">Sem observações</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  <strong className="text-lg font-black text-emerald-400">
                    R$ {Number(item.total).toFixed(2).replace(".", ",")}
                  </strong>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-sm font-bold text-slate-300 transition hover:text-white"
                    aria-label={`Remover ${item.name} do pedido`}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="summary-footer">
        <div className="summary-total-row">
          <p className="summary-total-label">Total</p>
          <p className="summary-total-value">
            R$ {Number(total).toFixed(2).replace(".", ",")}
          </p>
        </div>

        <div className="summary-actions">
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="btn btn-blue btn-full"
          >
            Confirmar pedido
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="btn btn-danger btn-full"
          >
            Limpar pedido
          </button>
        </div>
      </div>
    </aside>
  );
}