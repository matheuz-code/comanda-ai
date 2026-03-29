"use client";

export default function MenuCard({ item, onAdd }) {
  return (
    <article className="menu-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="menu-card-title">{item.name}</h3>
          <p className="menu-card-description">{item.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="menu-card-tag">{item.category}</span>
            <span className="click-hint">Clique em adicionar para incluir no pedido</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <span className="menu-card-price">
            R$ {Number(item.price).toFixed(2).replace(".", ",")}
          </span>

          <button
            type="button"
            onClick={() => onAdd(item)}
            className="btn btn-green"
            aria-label={`Adicionar ${item.name} ao pedido`}
            title={`Adicionar ${item.name}`}
          >
            Adicionar ao pedido
          </button>
        </div>
      </div>
    </article>
  );
}