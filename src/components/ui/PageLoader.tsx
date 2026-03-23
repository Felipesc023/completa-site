export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-50 z-50">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-2xl tracking-[0.3em] text-neutral-300 animate-pulse">
          COMPLETA
        </span>
        <div className="w-6 h-px bg-neutral-300 animate-pulse" />
      </div>
    </div>
  )
}
