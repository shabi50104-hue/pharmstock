import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { LoadingScreen } from "./components/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import { useExpiryAlerts } from "./hooks/useInventory";
import { LoginPage } from "./pages/LoginPage";
import type { TabRoute } from "./types";

import { AddDrugPage } from "./pages/AddDrugPage";
import { AlertsPage } from "./pages/AlertsPage";
// Lazy page imports resolved inline to keep bundle reasonable
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { SettingsPage } from "./pages/SettingsPage";

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState<TabRoute>("dashboard");
  const { data: alerts } = useExpiryAlerts(30);
  const alertCount = alerts?.filter((a) => !a.dismissed).length ?? 0;

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage onNavigate={setActiveTab} />;
      case "inventory":
        return <InventoryPage />;
      case "add":
        return <AddDrugPage onSuccess={() => setActiveTab("inventory")} />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onNavigate={setActiveTab}
        alertCount={alertCount}
        onSearchClick={
          activeTab !== "inventory"
            ? () => setActiveTab("inventory")
            : undefined
        }
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default function App() {
  const { isAuthenticated, loginStatus } = useAuth();

  if (loginStatus === "initializing") {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return <AuthenticatedApp />;
}
