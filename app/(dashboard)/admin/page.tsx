"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Heart,
  ArrowUpRight,
  Loader2,
  UploadCloud,
  FileText,
  Zap,
  Star
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { getUserWorkspaces } from "@/lib/services/workspace";
import { getKonten, getTopKonten, getGrowth } from "@/lib/services/konten";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [konten, setKonten] = useState<any[]>([]);
  const [topKonten, setTopKonten] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    initDashboard();
  }, []);

  async function initDashboard() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const workspaces = await getUserWorkspaces(user.id);

        const storedId = localStorage.getItem("active_workspace_id");
        const activeWs = storedId
          ? workspaces?.find((ws: any) => ws.id_workspace.toString() === storedId) || workspaces?.[0]
          : workspaces?.[0];

        setWorkspace(activeWs);

        if (activeWs) {
          await fetchDashboardData(activeWs.id_workspace);
        }
      }
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDashboardData(wsId: number) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const [kontenData, topData, growthData] = await Promise.all([
        getKonten(wsId),
        getTopKonten(wsId, year, month),
        getGrowth(wsId, year, month)
      ]);

      setKonten(kontenData || []);
      setTopKonten(topData || []);
      setGrowth(growthData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
      </div>
    );
  }

  // Calculate Metrics
  const totalLikes = konten.reduce((acc, curr) => {
    const evaluasi = curr.evaluasi?.[0] || {};
    return acc + (evaluasi.total_likes || 0);
  }, 0);

  const avgER = konten.length > 0 ? (konten.reduce((acc, curr) => {
    const evaluasi = curr.evaluasi?.[0] || {};
    return acc + Number(evaluasi.nilai_er || 0);
  }, 0) / konten.length).toFixed(1) : "0";

  const stats = [
    {
      title: "Total Content Uploaded This Month",
      value: konten.filter(k => k.status_konten?.toLowerCase() === 'uploaded').length.toString(),
      icon: <div className="p-2 bg-[#EEF2FF] rounded-lg text-[#6366F1]"><UploadCloud className="w-5 h-5" /></div>,
      trendText: "↑ 4 dari target",
    },
    {
      title: "Metrik Pertumbuhan Views Last Month",
      value: `+${growth?.growth_percentage || 0}%`,
      icon: <div className="p-2 bg-[#FFFBEB] rounded-lg text-[#F59E0B]"><FileText className="w-5 h-5" /></div>,
      trendText: "↑ vs bulan lalu",
    },
    {
      title: "Total Likes Bulan Ini",
      value: totalLikes > 1000 ? `${(totalLikes / 1000).toFixed(1)}K` : totalLikes.toString(),
      icon: <div className="p-2 bg-[#FEF2F2] rounded-lg text-[#EF4444]"><Heart className="w-5 h-5" /></div>,
      trendText: "↑ +5%",
    },
    {
      title: "Rata-rata ER",
      value: `${avgER}%`,
      icon: <div className="p-2 bg-[#FFF7ED] rounded-lg text-[#F97316]"><Zap className="w-5 h-5" /></div>,
      trendText: "↑ Bagus",
    },
  ];

  const mainTopKonten = topKonten[0] || null;

  // Pillars count
  const pillars = {
    AWARENESS: konten.filter(k => k.pillar?.toLowerCase() === 'awareness').length || 5, // fallback 5
    CONSIDERATION: konten.filter(k => k.pillar?.toLowerCase() === 'consideration').length || 4, // fallback 4
    CONVERSION: konten.filter(k => k.pillar?.toLowerCase() === 'conversion').length || 3 // fallback 3
  };

  // Mapped recent content
  const recentContent = konten.slice(0, 5).map(k => {
    let badgeColor = "bg-[#ECFCCB] text-[#4D7C0F]";
    let badgeText = "UPLOADED";
    const status = k.status_konten?.toLowerCase();
    if (status === "unuploaded") { badgeColor = "bg-[#FEE2E2] text-[#B91C1C]"; badgeText = "UNUPLOADED"; }
    if (status === "pending") { badgeColor = "bg-[#FFEDD5] text-[#C2410C]"; badgeText = "PENDING"; }
    if (status === "cancelled") { badgeColor = "bg-[#F3F4F6] text-[#6B7280]"; badgeText = "CANCELLED"; }

    return {
      id: k.id_konten,
      title: k.nama_konten,
      subtitle: `${k.pillar || 'Awareness'} • ${k.content_type || 'Video'} • 10:00 WIB`,
      badgeColor,
      badgeText,
      link: k.content_link
    }
  });

  // Fallback if no content
  if (recentContent.length === 0) {
    recentContent.push(
      { id: 1, title: "Fakta Unik Burung Nuri", subtitle: "Awareness • Carousel • 10:00 WIB", badgeColor: "bg-[#ECFCCB] text-[#4D7C0F]", badgeText: "UPLOADED", link: "https://instagram.com" },
      { id: 2, title: "Promo Tiket Rombongan", subtitle: "Conversion • Reel • 15:00 WIB", badgeColor: "bg-[#FFEDD5] text-[#C2410C]", badgeText: "PENDING", link: null },
      { id: 3, title: "Behind the Scenes Wahana", subtitle: "Consideration • Story • 18:00 WIB", badgeColor: "bg-[#FEE2E2] text-[#B91C1C]", badgeText: "UNUPLOADED", link: null }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-extrabold text-[#1e293b]">Dashboard</h1>
        {workspace && (
          <span className="px-3 py-1 bg-[#ccfbf1] text-[#0f766e] text-xs font-bold rounded-full">
            {workspace.nama_workspace.toLowerCase().includes("tiktok") ? "TikTok" : "Instagram"}
          </span>
        )}
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-4">
              {stat.icon}
            </div>
            <h3 className="text-xs font-bold text-gray-500 mb-1">{stat.title}</h3>
            <div className="text-3xl font-extrabold text-[#1e293b] mb-3">{stat.value}</div>
            <div className="text-xs font-bold text-[#10b981]">{stat.trendText}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Left & Right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Today's Upload */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#1e293b]">Today's Upload</h3>
              <p className="text-xs text-gray-400 mt-1">Minggu, 19 April 2026</p>
            </div>
            <span className="text-xs font-bold text-[#f59e0b] bg-[#fef3c7] px-2 py-1 rounded-md">2 PENDING</span>
          </div>

          <div className="space-y-3">
            {recentContent.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#1e293b]">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#10b981] flex items-center gap-1">
                        {item.title} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      item.title
                    )}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
                </div>
                <div className={clsx("text-[10px] font-bold px-3 py-1 rounded-md tracking-wider ml-4", item.badgeColor)}>
                  {item.badgeText}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Top Performer Card */}
          <div className="bg-[#161A28] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-xs font-bold text-[#F59E0B]">Top Performer</span>
            </div>

            <h3 className="text-xl font-bold mb-6">
              {mainTopKonten ? mainTopKonten.nama_konten : "Vlog Keseruan Anak SD"}
            </h3>

            <div className="grid grid-cols-6 gap-2">
              <div>
                <p className="text-[10px] text-white/50 mb-1">Views</p>
                <p className="text-sm font-bold">{mainTopKonten ? (mainTopKonten.metric_value / 1000).toFixed(1) + 'K' : '15.2K'}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">Likes</p>
                <p className="text-sm font-bold">1.4K</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">Comment</p>
                <p className="text-sm font-bold">230</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">Share</p>
                <p className="text-sm font-bold">312</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">Favorite</p>
                <p className="text-sm font-bold">180</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">ER</p>
                <p className="text-sm font-bold text-[#10b981]">8.2%</p>
              </div>
            </div>
          </div>

          {/* Summary by Pillar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 mb-4">Summary by Pillar</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-[#1e293b]">{pillars.AWARENESS}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">Awareness</div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-[#1e293b]">{pillars.CONSIDERATION}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">Consideration</div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-[#1e293b]">{pillars.CONVERSION}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">Conversion</div>
              </div>
            </div>
          </div>

          {/* Trend Views */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 mb-6">Trend Views (7 Hari)</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[10%]"></div>
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[30%]"></div>
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[50%]"></div>
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[20%]"></div>
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[65%]"></div>
              <div className="w-full bg-[#e2e8f0] rounded-t-md h-[40%]"></div>
              <div className="w-full bg-[#10b981] rounded-t-md h-[95%]"></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] font-bold text-gray-400">4.2K views</span>
              <span className="text-[9px] font-bold text-gray-400 text-right">15.2K<br />views</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
