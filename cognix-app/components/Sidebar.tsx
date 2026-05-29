"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CheckSquare, BookOpen, Code2,
  RefreshCw, TrendingUp, MessageSquare, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

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
  const { user } = useStore();
  const xpInLevel = user.xp % 100;

  return (
    <aside
      style={{ width: 248 }}
      className="h-full bg-white flex flex-col shrink-0"
      // Subtle right border using box-shadow instead of border for cleaner look
    >
      <div
        className="h-full flex flex-col"
        style={{ borderRight: "1px solid #e2e8f0" }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">Cognix</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-none">Tutor Particular</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-100 mb-2" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase px-2 py-2">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                  active
                    ? "bg-violet-600 text-white font-medium shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="truncate">{label}</span>
                {href === "/tutor" && !active && (
                  <span
                    className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: "#ede9fe", color: "#7c3aed" }}
                  >
                    IA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user level */}
        <div className="p-3">
          <div
            className="rounded-xl p-3"
            style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  {user.level}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Nível {user.level}</p>
                  <p className="text-[10px] text-slate-400">{user.xp} XP total</p>
                </div>
              </div>
              <span className="text-[10px] text-violet-500 font-medium">{100 - xpInLevel} XP</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "#ede9fe" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${xpInLevel}%`, background: "linear-gradient(to right, #7c3aed, #4f46e5)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
