"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Instagram, Clapperboard, Plus, Loader2, ArrowRight } from "lucide-react";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await getUserWorkspaces(user.id);
        setWorkspaces(data || []);

        const storedId = localStorage.getItem("active_workspace_id");
        if (storedId && data && data.find(ws => ws.id_workspace.toString() === storedId)) {
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

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName) return;
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createWorkspace(user.id, newWorkspaceName);
        setNewWorkspaceName("");
        fetchWorkspaces();
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Gagal membuat workspace");
    } finally {
      setIsCreating(false);
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

  // Skenario A: Belum punya workspace (Workspace.png)
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen flex bg-[#0c231f] font-sans overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 relative z-10">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#146b4f] rounded-full blur-[150px] opacity-20 -translate-y-1/2 -z-10" />
          <h1 className="text-6xl font-extrabold tracking-tight flex items-center">
            <span className="text-[#10b981]">SANGGA</span>
            <span className="text-white">LURI</span>
          </h1>
        </div>

        {/* Right Panel - Add Workspace */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-20">
          <div className="w-full max-w-md bg-[#161E20] p-10 sm:p-14 rounded-[3rem] shadow-2xl border border-white/5 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Sanggaluri Workspace</h2>
            <p className="text-[#849591] text-sm mb-10 leading-relaxed">
              Your personal space to plan, grow, and achieve more.
            </p>

            <form onSubmit={handleCreateWorkspace} className="relative">
              <input
                type="text"
                placeholder="Workspace name"
                className="w-full px-6 py-4 bg-[#0f1516] border border-white/10 text-white placeholder:text-[#455753] rounded-full outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm pr-24"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isCreating}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#052e24] text-white font-bold rounded-full hover:bg-[#073d30] transition-all flex items-center gap-2 text-xs border border-[#10b981]/30 disabled:opacity-70"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Skenario B: Sudah punya workspace (Workspace-1.png)
  return (
    <div className="min-h-screen bg-[#0c231f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#146b4f] rounded-full blur-[120px] opacity-20 -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#146b4f] rounded-full blur-[120px] opacity-10 -z-10" />

      <div className="w-full max-w-md bg-[#161E20] p-10 sm:p-14 rounded-[3rem] shadow-2xl border border-white/5 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Pilih Workspace</h2>
        <p className="text-[#849591] text-sm mb-10">Halo! Pilih workspace untuk mulai bekerja.</p>

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
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                  isTikTok ? "bg-black" : "bg-gradient-to-tr from-pink-500 to-yellow-500"
                )}>
                  {isTikTok ? <Clapperboard className="w-6 h-6" /> : <Instagram className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className={clsx("font-bold", isSelected ? "text-white" : "text-white/80")}>{isTikTok ? "TikTok" : "Instagram"}</span>
                  <span className="text-xs opacity-60">@{ws.nama_workspace.toLowerCase().replace(/\s+/g, '')}</span>
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

        <button
          onClick={() => setWorkspaces([])} // Trigger scenario A for demo or just allow adding
          className="mt-6 text-[#849591] text-xs font-semibold hover:text-[#10b981] transition-colors"
        >
          + Tambah Workspace Lain
        </button>
      </div>
    </div>
  );
}
