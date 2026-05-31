export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}
