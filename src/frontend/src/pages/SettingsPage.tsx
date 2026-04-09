import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Info, Shield, Sun } from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";

export function SettingsPage() {
  const { principalText } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function handleThemeToggle(checked: boolean) {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }

  return (
    <div className="px-4 py-4 space-y-5" data-ocid="settings-page">
      <h2 className="font-display font-bold text-lg text-foreground">
        Settings
      </h2>

      {/* Account section */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account
        </h3>
        <LogoutButton />
        {principalText && (
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <div className="flex items-start gap-2">
              <Shield
                size={14}
                className="text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Internet Identity Principal
                </p>
                <p className="text-xs text-foreground font-mono break-all mt-0.5">
                  {principalText}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Preferences
        </h3>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sun size={18} className="text-muted-foreground" />
              <Label
                htmlFor="theme-toggle"
                className="font-medium cursor-pointer"
              >
                Light theme
              </Label>
            </div>
            <Switch
              id="theme-toggle"
              checked={!isDarkMode}
              onCheckedChange={handleThemeToggle}
              data-ocid="theme-toggle"
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted-foreground" />
              <Label
                htmlFor="notif-toggle"
                className="font-medium cursor-pointer"
              >
                Expiry notifications
              </Label>
            </div>
            <Switch
              id="notif-toggle"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              data-ocid="notif-toggle"
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          About
        </h3>
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-primary" />
            <p className="font-display font-semibold text-foreground">
              PharmaStock
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mobile pharmacy drug stock management with expiry alerts and bill
            scanning. Built on the Internet Computer for secure, decentralized
            data storage.
          </p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </section>

      {/* Branding */}
      <div className="text-center py-4">
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
