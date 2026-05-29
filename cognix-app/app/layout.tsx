import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Cognix — Tutor Particular",
  description: "Plataforma de gerenciamento de estudos com IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased flex overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
