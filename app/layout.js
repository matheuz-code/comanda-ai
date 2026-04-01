import "./globals.css";
import { OrderProvider } from "../context/OrderContext";

export const metadata = {
  title: "Comanda AI",
  description: "Sistema de comanda digital com IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}