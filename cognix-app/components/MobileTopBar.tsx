"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Globe, LogOut, Settings2, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function MobileTopBar() {
  const router = useRouter();
  const { groups, activeGroupId, setActiveGroup, user } = useStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("cognix_expire");
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="mobile-topbar"
      style={{
        display: "none",
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Group switcher */}
      <div ref={ref} style={{ flex: 1, position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: 10,
            border: `1.5px solid ${activeGroup ? `${activeGroup.color}30` : "var(--border)"}`,
            background: activeGroup ? `${activeGroup.color}12` : "var(--surface-subtle)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16 }}>{activeGroup ? activeGroup.emoji : "🌐"}</span>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeGroup ? activeGroup.name : "Visão Geral"}
          </span>
          <ChevronDown style={{ width: 14, height: 14, color: "var(--text-muted)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
            boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.3)", overflow: "hidden",
          }}>
            <button
              onClick={() => { setActiveGroup(null); setOpen(false); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "none", cursor: "pointer", background: activeGroupId === null ? "var(--primary-subtle)" : "transparent", color: activeGroupId === null ? "var(--primary-subtle-text)" : "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}
            >
              <Globe style={{ width: 15, height: 15, flexShrink: 0 }} />
              Visão Geral
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => { setActiveGroup(g.id); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "none", borderTop: "1px solid var(--border)", cursor: "pointer", background: activeGroupId === g.id ? `${g.color}18` : "transparent", color: activeGroupId === g.id ? g.color : "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}
              >
                <span style={{ fontSize: 16 }}>{g.emoji}</span>
                <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                {activeGroupId === g.id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* XP + configurações + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 99, background: "var(--primary-subtle)", border: "1px solid var(--primary-subtle-border)" }}>
          <Trophy style={{ width: 12, height: 12, color: "var(--primary-subtle-text)" }} />
          <span style={{ fontSize: 12, fontWeight: 750, color: "var(--primary-subtle-text)" }}>Nv.{user.level}</span>
        </div>
        {activeGroup && (
          <Link href={`/groups/${activeGroup.id}`} style={{ padding: 8, borderRadius: 8, background: "var(--surface-subtle)", color: "var(--text-muted)", display: "flex" }}>
            <Settings2 style={{ width: 15, height: 15 }} />
          </Link>
        )}
        <button onClick={handleLogout} style={{ padding: 8, borderRadius: 8, border: "none", background: "var(--surface-subtle)", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
          <LogOut style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}
