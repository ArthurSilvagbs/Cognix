"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CheckSquare,
  TrendingUp, GraduationCap,
  ChevronDown, Globe, Plus, Settings2, FolderOpen, LogOut, BookOpen,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/groups",     label: "Grupos",      icon: FolderOpen      },
  { href: "/sessions",   label: "Sessões",      icon: BookOpen        },
  { href: "/tasks",      label: "Tarefas",     icon: CheckSquare     },
  { href: "/evolution",  label: "Evolução",     icon: TrendingUp      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, groups, activeGroupId, setActiveGroup } = useStore();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("cognix_expire");
    router.push("/login");
    router.refresh();
  }
  const xpInLevel = user.xp % 100;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectGroup(id: string | null) {
    setActiveGroup(id);
    setDropdownOpen(false);
  }

  return (
    <>
    <aside style={{ width: 248, borderRight: "1px solid var(--border)", background: "var(--surface)" }} className="app-sidebar h-full flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}>
            <GraduationCap className="w-4 h-4" style={{ color: "var(--bg)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">Cognix</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-none">Tutor Particular</p>
          </div>
        </div>
      </div>

      {/* Group switcher */}
      <div className="px-3 pb-2" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeGroup ? `${activeGroup.color}14` : "var(--surface-subtle)",
              border: `1.5px solid ${activeGroup ? `${activeGroup.color}30` : "var(--border)"}`,
            }}
          >
            <span className="text-base leading-none shrink-0">
              {activeGroup ? activeGroup.emoji : "🌐"}
            </span>
            <span className="flex-1 text-left truncate text-slate-700">
              {activeGroup ? activeGroup.name : "Visão Geral"}
            </span>
            <ChevronDown
              className={cn("w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform", dropdownOpen && "rotate-180")}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.25)" }}
            >
              {/* All groups option */}
              <button
                onClick={() => selectGroup(null)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                style={activeGroupId === null ? { background: "var(--primary-subtle)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}
              >
                <Globe className="w-4 h-4 shrink-0" style={{ color: activeGroupId === null ? "var(--primary-subtle-text)" : "var(--text-muted)" }} />
                <span className="font-medium">Visão Geral</span>
                {activeGroupId === null && <span className="ml-auto text-xs" style={{ color: "var(--primary-subtle-text)" }}>●</span>}
              </button>

              {groups.length > 0 && (
                <div className="h-px mx-3 my-1" style={{ background: "var(--border)" }} />
              )}

              {/* Group list */}
              <div className="max-h-48 overflow-y-auto">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => selectGroup(g.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                    style={activeGroupId === g.id ? { background: `${g.color}20`, color: g.color } : { color: "var(--text-secondary)" }}
                  >
                    <span className="text-base leading-none shrink-0">{g.emoji}</span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate">{g.name}</p>
                      {g.description && <p className="text-xs text-slate-400 truncate">{g.description}</p>}
                    </div>
                    {activeGroupId === g.id && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: g.color }} />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-px mx-3 my-1" style={{ background: "var(--border)" }} />

              <Link
                href="/groups"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span>Gerenciar grupos</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Active group indicator */}
      {activeGroup && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: `${activeGroup.color}10`, border: `1px dashed ${activeGroup.color}40` }}>
          <span className="text-sm">{activeGroup.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: activeGroup.color }}>{activeGroup.name}</p>
            <p className="text-xs text-slate-400">contexto ativo</p>
          </div>
          <Link href={`/groups/${activeGroup.id}`} className="shrink-0">
            <Settings2 className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 transition-colors" />
          </Link>
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 h-px mb-2" style={{ background: "var(--border)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                active ? "font-medium shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
              )}
              style={active
                ? { background: "var(--primary)", color: "var(--bg)" }
                : {}}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="truncate">{label}</span>
              {href === "/tutor" && !active && (
                <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: "var(--primary-subtle)", color: "var(--primary-subtle-text)" }}>IA</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* XP card + logout */}
      <div className="p-3 space-y-2">
        <div className="rounded-xl p-3" style={{ background: "var(--primary-subtle)", border: "1px solid var(--primary-subtle-border)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--primary)", color: "var(--bg)" }}>
                {user.level}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Nível {user.level}</p>
                <p className="text-[10px] text-slate-400">{user.xp} XP total</p>
              </div>
            </div>
            <span className="text-[10px] font-medium" style={{ color: "var(--primary-subtle-text)" }}>{100 - xpInLevel} XP</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--primary-subtle-border)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${xpInLevel}%`, background: "var(--primary)" }} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>

    {/* Bottom nav — visible only on mobile via CSS */}
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        return (
          <Link key={href} href={href} className={cn("bottom-nav-item", active && "active")}>
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
