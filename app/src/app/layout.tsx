import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/wireframe.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cognix",
  description: "Gerenciador de estudos que decide o que estudar hoje por você.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dark é o padrão (wireframe.css :root); claro via data-theme="light".
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
