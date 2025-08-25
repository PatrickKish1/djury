"use client";

import { useState } from "react";
import { Icon } from "./DemoComponents";
import { useRouter, usePathname } from "next/navigation";

interface GlobalTabsProps {
  onTabChange?: (tabId: string) => void;
  isMainPage?: boolean;
  currentActiveView?: string;
}

export function GlobalTabs({ onTabChange, isMainPage = false, currentActiveView }: GlobalTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    // Determine active tab based on current path
    if (pathname === "/") return "home";
    if (pathname.startsWith("/disputes/")) return "disputes";
    if (pathname.includes("/search")) return "search";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  });

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    if (isMainPage && onTabChange) {
      // For main page, use callback instead of routing
      onTabChange(tabId);
    } else {
      // For other pages (like dispute details), route normally
      if (tabId === "home") {
        router.push("/");
      } else if (tabId === "disputes") {
        router.push("/");
      } else if (tabId === "search") {
        router.push("/");
      } else if (tabId === "profile") {
        router.push("/");
      }
    }
  };

  // Use the prop if provided (for main page), otherwise use local state
  const displayActiveTab = currentActiveView || activeTab;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--app-card-border)] px-2 py-2">
        <div className="flex space-x-1">
          {[
            { id: "home", label: "Home", icon: "home" as const },
            { id: "search", label: "Search", icon: "search" as const },
            { id: "disputes", label: "Disputes", icon: "alert-circle" as const },
            { id: "profile", label: "Profile", icon: "user" as const }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                displayActiveTab === tab.id
                  ? "bg-[var(--app-accent)] text-[var(--app-background)] tab-active"
                  : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-accent-light)]"
              }`}
            >
              <Icon name={tab.icon} size="sm" className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
