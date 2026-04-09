import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, FileText, Package, Shield } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: Package,
    title: "Drug Inventory",
    desc: "Track stock levels, batches, and pricing across all medications",
  },
  {
    icon: Bell,
    title: "Expiry Alerts",
    desc: "Get notified 30 days before drugs expire to prevent waste",
  },
  {
    icon: FileText,
    title: "Bill Scanning",
    desc: "Upload purchase bills as images and extract data automatically",
  },
];

export function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero header */}
      <div className="bg-primary text-primary-foreground px-6 pt-14 pb-10">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="7"
                width="32"
                height="22"
                rx="5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 18h12M18 12v12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Pharma<span className="font-light opacity-80">Stock</span>
          </h1>
          <p className="mt-2 text-primary-foreground/80 text-base">
            Professional pharmacy drug stock management for your team
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          What you get
        </p>
        <div className="space-y-3 mb-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border animate-slide-up"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Login CTA */}
        <div className="space-y-3">
          <Button
            onClick={login}
            disabled={isLoading}
            data-ocid="login-btn"
            className="w-full h-12 font-display font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in with Internet Identity
                <ArrowRight size={18} />
              </span>
            )}
          </Button>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Shield size={12} className="text-primary" />
            <span>Secured by Internet Computer cryptography</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
