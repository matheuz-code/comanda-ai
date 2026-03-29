"use client";

const styles = {
  novo: "status-badge status-novo",
  preparo: "status-badge status-preparo",
  pronto: "status-badge status-pronto",
};

export default function StatusBadge({ status }) {
  const safeStatus = styles[status] ? status : "novo";
  return <span className={styles[safeStatus]}>{safeStatus}</span>;
}