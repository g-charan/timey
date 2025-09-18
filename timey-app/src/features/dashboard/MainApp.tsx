// File: src/renderer/src/components/MainApp.tsx (Fully Implemented)
// NOTE: You'll need these libraries:

import { useState, useEffect } from "react";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { renderView } from "@/features/dashboard/routes/main_routing";

// --- Main Application Component ---

function MainApp() {
  const [activeView, setActiveView] = useState("dashboard");

  // Initialize global keyboard shortcuts
  useGlobalShortcuts(setActiveView);

  // Handle navigation from overlay
  useEffect(() => {
    const handleNavigation = () => {
      const navigateTo = localStorage.getItem("timey-navigate-to");
      if (navigateTo) {
        setActiveView(navigateTo);
        localStorage.removeItem("timey-navigate-to");
      }
    };

    // Check for navigation intent when window gains focus
    window.addEventListener("focus", handleNavigation);

    // Also check periodically in case the event doesn't fire
    const interval = setInterval(handleNavigation, 1000);

    return () => {
      window.removeEventListener("focus", handleNavigation);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex h-screen">
      <SidebarProvider>
        <AppSidebar setActiveView={setActiveView} />
        <div className="flex-grow flex flex-col overflow-hidden">
          <header className="p-4 border-b flex justify-end items-center flex-shrink-0">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-grow p-6 bg-muted/40 overflow-y-auto">
            {renderView(activeView)}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default MainApp;
