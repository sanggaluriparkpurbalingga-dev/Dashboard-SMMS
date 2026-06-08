"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileEdit,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
import Image from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/client";
import { logoutAdminAction } from "@/lib/actions/auth";
import { getUserWorkspaces } from "@/lib/services/workspace";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Kalender", href: "/calendar", icon: Calendar },
  { name: "Content Plan", href: "/content-plan", icon: FileEdit },
  { name: "Evaluasi", href: "/evaluation", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const workspaces = await getUserWorkspaces(user.id);
      if (workspaces && workspaces.length > 0) {
        const storedId = localStorage.getItem("active_workspace_id");
        const active = storedId
          ? workspaces.find(
              (ws: any) => ws.id_workspace.toString() === storedId,
            ) || workspaces[0]
          : workspaces[0];
        setActiveWorkspace(active);

        // Also ensure the stored ID matches the one we're using
        localStorage.setItem(
          "active_workspace_id",
          active.id_workspace.toString(),
        );
        localStorage.setItem(
          "active_workspace_name",
          active.nama_workspace || "",
        );
      }
    } else {
      router.push("/login");
    }
  }

  const handleLogout = async () => {
    try {
      await logoutAdminAction();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#122C28] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-[#1B3C37] flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo.jpeg" 
              alt="SanggaluriMS Logo" 
              width={40} 
              height={40} 
              className="object-cover w-full h-full"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight">
              SanggaluriMS
            </span>
            <span className="text-[10px] text-white/50 tracking-widest uppercase">
              Social Media Management
            </span>
          </div>
        </div>

        {/* Workspace Selector (Top) */}
        <div className="px-6 py-4 border-t border-b border-[#1B3C37]">
          <Link href="/workspaces" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              {activeWorkspace?.nama_workspace
                ?.toLowerCase()
                .includes("tiktok") ? (
                <Image src="/tiktok.svg" alt="TikTok" width={24} height={24} sizes="24px" />
              ) : (
                <Image src="/instagram.svg" alt="Instagram" width={24} height={24} sizes="24px" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">
                {activeWorkspace?.nama_workspace || "Pilih Workspace"}
              </span>
              <span className="text-xs text-white/50">Switch Workspace</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Main Menu
            </span>
          </div>
          <nav className="px-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium min-h-[44px]",
                    isActive
                      ? "bg-[#10b981]/10 border border-[#10b981]/30 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-[#10b981]"
                        : "text-white/50 group-hover:text-white",
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-[#1B3C37]">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-white/20 text-white hover:bg-white/5 rounded-xl transition-all duration-200 min-h-[44px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Only visible on mobile) */}
        <header className="h-16 bg-white border-b border-border-custom flex items-center px-4 lg:hidden shrink-0">
          <button
            className="touch-target -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-bold text-gray-900">SanggaluriMS</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Yakin Ingin Keluar?"
        description="Apakah kamu yakin ingin keluar dari SanggaluriMS?"
        subDescription="Sesi kamu akan diakhiri dan kamu harus login kembali untuk masuk ke dashboard"
        cancelText="Batal"
        confirmText="Ya, Keluar"
      />
    </div>
  );
}
