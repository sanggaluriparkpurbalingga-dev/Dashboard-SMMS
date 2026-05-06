"use client";

import React, { useEffect, useState, use } from "react";
import {
  BarChart3,
  Users,
  Heart,
  Eye,
  ArrowLeft,
  Settings,
  Calendar as CalendarIcon,
  Filter,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { getWorkspaceById } from "@/lib/services/workspace";
import { getKonten, getGrowth } from "@/lib/services/konten";

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [workspace, setWorkspace] = useState<any>(null);
  const [konten, setKonten] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const wsId = resolvedParams.id;

        // Fetch workspace detail
        const wsData = await getWorkspaceById(wsId);
        setWorkspace(wsData);

        if (wsData) {
          const now = new Date();
          const [kontenData, growthData] = await Promise.all([
            getKonten(wsId),
            getGrowth(Number(wsId), now.getFullYear(), now.getMonth() + 1)
          ]);
          setKonten(kontenData || []);
          setGrowth(growthData);
        }
      } catch (error) {
        console.error("Error loading workspace details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-sanggaluri" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Workspace Tidak Ditemukan</h2>
        <p className="text-gray-500">Pilih workspace yang valid dari halaman utama.</p>
        <Link href="/workspaces" className="px-6 py-2 bg-sanggaluri text-white rounded-xl font-bold hover:bg-sanggaluri-light transition-colors">
          Kembali ke Workspaces
        </Link>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Konten",
      value: konten.length,
      icon: Users,
      trend: { value: 0, isPositive: true },
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Reach (30d)",
      value: growth?.total_views_bulan_ini || 0,
      icon: Eye,
      trend: { value: growth?.growth_percentage || 0, isPositive: (growth?.growth_percentage || 0) >= 0 },
      iconColor: "bg-views/10 text-views",
    },
    {
      title: "Interaksi (Likes)",
      value: konten.reduce((acc, curr) => {
        const evaluasi = curr.evaluasi?.[0] || {};
        return acc + (evaluasi.total_likes || 0);
      }, 0),
      icon: Heart,
      trend: { value: 0, isPositive: true },
      iconColor: "bg-likes/10 text-likes",
    },
    {
      title: "ER (Engagement Rate)",
      value: konten.length > 0 ? (konten.reduce((acc, curr) => {
        const evaluasi = curr.evaluasi?.[0] || {};
        return acc + Number(evaluasi.nilai_er || 0);
      }, 0) / konten.length).toFixed(2) + "%" : "0%",
      icon: BarChart3,
      trend: { value: 0, isPositive: true },
      iconColor: "bg-growth/10 text-growth",
    },
  ];

  const formattedKonten = konten.map(k => {
    const evaluasi = k.evaluasi?.[0] || {};
    return {
      id: k.id_konten?.toString() || Math.random().toString(),
      title: k.nama_konten,
      date: new Date(k.created_at).toLocaleDateString(),
      views: evaluasi.total_views?.toString() || "0",
      likes: evaluasi.total_likes?.toString() || "0",
      comments: evaluasi.total_comment?.toString() || "0",
      status: k.status_konten ? k.status_konten.charAt(0).toUpperCase() + k.status_konten.slice(1).toLowerCase() : "Pending" as any,
      thumbnail: `https://picsum.photos/seed/${k.id_konten || 'x'}/200/200`
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workspaces" className="p-2 bg-white border border-border-custom rounded-xl hover:bg-gray-50 transition-all text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{workspace.nama_workspace}</h2>
              <span className="px-2 py-0.5 bg-sanggaluri/10 text-sanggaluri text-xs font-bold rounded-md">Aktif</span>
            </div>
            <p className="text-gray-500">Detail performa dan pengelolaan konten workspace.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-border-custom text-gray-500 rounded-xl hover:bg-gray-50 transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-sanggaluri text-white font-bold rounded-xl hover:bg-sanggaluri-light transition-all shadow-md">
            <CalendarIcon className="w-5 h-5" />
            <span>Atur Jadwal</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend.value !== 0 ? stat.trend : undefined}
            iconColorClassName={stat.iconColor}
          />
        ))}
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Konten Terbaru</h3>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sanggaluri">
            <Filter className="w-4 h-4" />
            <span>Filter Data</span>
          </button>
        </div>

        <ContentTable
          title="Semua Konten Workspace"
          items={formattedKonten}
        />
      </div>
    </div>
  );
}
