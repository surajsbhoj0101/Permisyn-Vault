function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/92 backdrop-blur-lg" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
        

        <div className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)", color: "var(--muted)" }}>
          Last sync: just now
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;