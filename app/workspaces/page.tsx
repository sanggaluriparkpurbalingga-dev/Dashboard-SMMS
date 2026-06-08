"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getUserWorkspaces, createWorkspace } from "@/lib/services/workspace";
import { clsx } from "clsx";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedWsId, setSelectedWsId] = useState<number | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const data = await getUserWorkspaces(user.id);
        setWorkspaces(data || []);

        const storedId = localStorage.getItem("active_workspace_id");
        if (
          storedId &&
          data &&
          data.find((ws: any) => ws.id_workspace.toString() === storedId)
        ) {
          setSelectedWsId(Number(storedId));
        } else if (data && data.length > 0) {
          setSelectedWsId(data[0].id_workspace);
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEnterDashboard = () => {
    if (selectedWsId) {
      localStorage.setItem("active_workspace_id", selectedWsId.toString());
      router.push("/admin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c231f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#10b981] animate-spin" />
      </div>
    );
  }

  // Skenario jika belum ada data (Fallback)
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-[#0c231f] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          No Workspaces Found
        </h1>
        <p className="text-[#849591] max-w-md">
          Akun Anda belum terhubung dengan workspace Instagram atau TikTok.
          Silakan hubungi administrator.
        </p>
      </div>
    );
  }

  // Skenario B: Sudah punya workspace (Fixed)
  return (
    <div className="min-h-screen bg-[#0c231f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#146b4f] rounded-full blur-[120px] opacity-20 -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#146b4f] rounded-full blur-[120px] opacity-10 -z-10" />

      <div className="w-full max-w-md bg-[#161E20] p-10 sm:p-14 rounded-[3rem] shadow-2xl border border-white/5 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Pilih Workspace</h2>
        <p className="text-[#849591] text-sm mb-10">
          Halo! Pilih workspace untuk mulai bekerja.
        </p>

        <div className="space-y-4 mb-10">
          {workspaces.map((ws: any) => {
            const isTikTok = ws.nama_workspace.toLowerCase().includes("tiktok");
            const isSelected = selectedWsId === ws.id_workspace;

            return (
              <button
                key={ws.id_workspace}
                onClick={() => setSelectedWsId(ws.id_workspace)}
                className={clsx(
                  "w-full p-4 rounded-2xl flex items-center gap-4 border transition-all text-left group",
                  isSelected
                    ? "bg-[#10b981]/10 border-[#10b981] text-white"
                    : "bg-[#0f1516] border-white/5 text-[#849591] hover:border-white/20"
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden",
                    isTikTok ? "bg-white" : "bg-white"
                  )}
                >
                  {isTikTok ? (
                    <Image
                      src="/tiktok.svg"
                      alt="TikTok"
                      width={28}
                      height={28}
                      sizes="28px"
                    />
                  ) : (
                    <Image
                      src="/instagram.svg"
                      alt="Instagram"
                      width={28}
                      height={28}
                      sizes="28px"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={clsx(
                      "font-bold",
                      isSelected ? "text-white" : "text-white/80"
                    )}
                  >
                    {isTikTok ? "TikTok" : "Instagram"}
                  </span>
                  <span className="text-xs opacity-60">
                    @{ws.nama_workspace.toLowerCase().replace(/\s+/g, "")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleEnterDashboard}
          className="w-full py-4 bg-[#10b981] text-white font-bold rounded-2xl hover:bg-[#059669] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20"
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
