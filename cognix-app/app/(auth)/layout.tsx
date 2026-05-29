export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full" style={{ background: "radial-gradient(ellipse at 20% 50%, #2d1b69 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #1e1b4b 0%, transparent 40%), #080810" }}>
      {children}
    </div>
  );
}
