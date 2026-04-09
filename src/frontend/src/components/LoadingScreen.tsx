export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-primary"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="6"
              width="28"
              height="20"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M10 16h12M16 10v12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="8"
              r="4"
              fill="currentColor"
              className="text-accent"
            />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground">
          PharmaStock
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Loading your inventory…
        </p>
      </div>
    </div>
  );
}
