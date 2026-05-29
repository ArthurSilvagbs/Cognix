"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Code2,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/sessions", label: "Sessões", icon: BookOpen },
  { href: "/exercises", label: "Exercícios", icon: Code2 },
  { href: "/training", label: "Treino de Código", icon: RefreshCw },
  { href: "/evolution", label: "Evolução", icon: TrendingUp },
  { href: "/tutor", label: "Tutor IA", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Cognix</p>
          <p className="text-xs text-gray-500 leading-tight">Tutor Particular</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-purple-700 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
