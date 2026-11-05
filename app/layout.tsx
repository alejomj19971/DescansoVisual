import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Descanso Ojos · Regla 20-20-20",
  description: "Recordatorio de descansos visuales cada 20 minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
