"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { clsx } from "clsx";
import { Modal } from "@/components/ui/Modal";
import { SuccessDialog } from "@/components/ui/SuccessDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getKonten } from "@/lib/services/konten";
import { createEvaluasi, updateEvaluasi, deleteEvaluasi, getEvaluasiByKonten } from "@/lib/services/evaluasi";
import { Loader2 } from "lucide-react";

// We will fetch real data from the database

const statusUploadOptions = ["Uploaded", "Unuploaded", "Pending", "Cancelled"];

export default function EvaluationPage() {
  const [loading, setLoading] = useState(true);
  const [kontenList, setKontenList] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState(0); // 0: All, 1: Last Week
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [limit, setLimit] = useState(10);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    id_evaluasi: "", id_konten: "", name: "", uploadDate: "", evalDate: "", views: "", likes: "", comments: "", shares: "", favs: "", statusUpload: "Uploaded"
  });

  const [addForm, setAddForm] = useState({
    id_konten: "", name: "", uploadDate: "", evalDate: "", views: "", likes: "", comments: "", shares: "", favs: "", statusUpload: "Uploaded"
  });

  useEffect(() => {
    fetchData();
  }, [selectedMonth, activeFilter, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const workspaceId = localStorage.getItem("active_workspace_id");
      if (!workspaceId) return;

      const data = await getKonten(workspaceId);
      
      // Apply filters client-side for now to match the UI behavior
      let filteredData = [...data];
      
      // Filter by month if not 'all'
      if (selectedMonth !== 'all') {
        const monthMap: Record<string, number> = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };
        const targetMonth = monthMap[selectedMonth.toLowerCase()];
        filteredData = filteredData.filter((item: any) => {
          if (!item.tanggal_upload) return false;
          return new Date(item.tanggal_upload).getMonth() === targetMonth;
        });
      }

      // Filter by Last Week if activeFilter === 1
      if (activeFilter === 1) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        filteredData = filteredData.filter((item: any) => {
          if (!item.tanggal_upload) return false;
          return new Date(item.tanggal_upload) >= lastWeek;
        });
      }

      setKontenList(filteredData.slice(0, limit));

      // Compute Stats
      const uploaded = data.filter((k: any) => k.status_konten === 'uploaded').length;
      const unuploaded = data.filter((k: any) => k.status_konten === 'unuploaded').length;
      const pending = data.filter((k: any) => k.status_konten === 'pending').length;
      const cancelled = data.filter((k: any) => k.status_konten === 'cancelled').length;

      setStats([
        { label: "Total Konten", value: data.length },
        { label: "Uploaded", value: uploaded, valueColor: "text-[#10b981]" },
        { label: "Unuploaded", value: unuploaded, valueColor: "text-[#ef4444]" },
        { label: "Pending", value: pending, valueColor: "text-[#f59e0b]" },
        { label: "Cancelled", value: cancelled, valueColor: "text-[#64748b]" },
      ]);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (konten: any) => {
    const evalData = konten.evaluasi?.[0];
    setSelectedRow(konten);
    setEditForm({
      id_evaluasi: evalData?.id_evaluasi || "",
      id_konten: konten.id_konten,
      name: konten.nama_konten,
      uploadDate: konten.tanggal_upload ? new Date(konten.tanggal_upload).toISOString().split('T')[0] : "",
      evalDate: evalData?.tanggal_evaluasi ? new Date(evalData.tanggal_evaluasi).toISOString().split('T')[0] : "",
      views: evalData?.total_views?.toString() || "0",
      likes: evalData?.total_likes?.toString() || "0",
      comments: evalData?.total_comment?.toString() || "0",
      shares: evalData?.total_shares?.toString() || "0",
      favs: evalData?.total_favorites?.toString() || "0",
      statusUpload: konten.status_konten ? konten.status_konten.charAt(0).toUpperCase() + konten.status_konten.slice(1) : "Uploaded"
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (editForm.id_evaluasi) {
        await updateEvaluasi(editForm.id_evaluasi, {
          tanggal_evaluasi: editForm.evalDate ? new Date(editForm.evalDate) : null,
          total_views: parseInt(editForm.views),
          total_likes: parseInt(editForm.likes),
          total_comment: parseInt(editForm.comments),
          total_shares: parseInt(editForm.shares),
          total_favorites: parseInt(editForm.favs),
        });
      } else {
        await createEvaluasi({
          id_konten: Number(editForm.id_konten),
          tanggal_evaluasi: editForm.evalDate ? new Date(editForm.evalDate) : null,
          total_views: parseInt(editForm.views),
          total_likes: parseInt(editForm.likes),
          total_comment: parseInt(editForm.comments),
          total_shares: parseInt(editForm.shares),
          total_favorites: parseInt(editForm.favs),
        });
      }

      setIsEditOpen(false);
      setSuccessMsg("Laporan performa untuk konten ini berhasil disimpan.");
      fetchData();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("Gagal menyimpan evaluasi");
    }
  };

  const handleDelete = (konten: any) => {
    const evalData = konten.evaluasi?.[0];
    if (evalData) {
      setDeleteConfirm(evalData);
    } else {
      alert("Konten ini belum memiliki data evaluasi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEvaluasi(deleteConfirm.id_evaluasi);
      setDeleteConfirm(null);
      setSuccessMsg("Berhasil Dihapus!\nData evaluasi sudah berhasil dihapus.");
      fetchData();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      alert("Gagal menghapus evaluasi");
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const workspaceId = localStorage.getItem("active_workspace_id");
    if (!workspaceId) return;

    const filterType = activeFilter === 1 ? 'last_week' : 'all';
    const params = new URLSearchParams({
      workspaceId,
      month: selectedMonth,
      filter: filterType,
      format
    });

    window.open(`/api/export-laporan?${params.toString()}`, '_blank');
  };

  const handleSaveAdd = async () => {
    try {
      await createEvaluasi({
        id_konten: Number(addForm.id_konten),
        tanggal_evaluasi: addForm.evalDate ? new Date(addForm.evalDate) : null,
        total_views: parseInt(addForm.views) || 0,
        total_likes: parseInt(addForm.likes) || 0,
        total_comment: parseInt(addForm.comments) || 0,
        total_shares: parseInt(addForm.shares) || 0,
        total_favorites: parseInt(addForm.favs) || 0,
      });

      setIsAddOpen(false);
      setSuccessMsg("Data evaluasi berhasil ditambahkan.");
      fetchData();
    } catch (error) {
      console.error("Error adding evaluation:", error);
      alert("Gagal menambahkan evaluasi");
    }
  };

  // Compute ER from form values
  const computeER = (form: any) => {
    const views = parseInt(form.views) || 0;
    const likes = parseInt(form.likes) || 0;
    const comments = parseInt(form.comments) || 0;
    const shares = parseInt(form.shares) || 0;
    const favs = parseInt(form.favs) || 0;
    if (views === 0) return "0.00%";
    return ((likes + comments + shares + favs) / views * 100).toFixed(2) + "%";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#1e293b]">Evaluasi</h1>
          <span className="px-3 py-1 bg-[#ccfbf1] text-[#0f766e] text-xs font-bold rounded-full">TikTok</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</h3>
            <div className={clsx("text-3xl font-extrabold", stat.valueColor || "text-[#1e293b]")}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Date + Export Row */}
      <div className="flex items-center justify-end gap-3">
        <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-xs font-bold text-gray-500">
          Min, 19 Apr 2026
        </div>
        <div className="relative group">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#122C28] text-white text-xs font-bold rounded-xl hover:bg-[#1B3C37] transition-all">
            <Download className="w-4 h-4" />
            <span>Export Laporan</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <div className="py-2">
              <button 
                onClick={() => handleExport('xlsx')}
                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Export as Excel (.xlsx)
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Export as CSV (.csv)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-xl font-bold text-[#1e293b]">Tabel Evaluasi Konten</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:border-[#10b981]"
            >
              <option value="all">Semua Bulan</option>
              <option value="jan">Januari</option>
              <option value="feb">Februari</option>
              <option value="mar">Maret</option>
              <option value="apr">April</option>
              <option value="may">Mei</option>
              <option value="jun">Juni</option>
              <option value="jul">Juli</option>
              <option value="aug">Agustus</option>
              <option value="sep">September</option>
              <option value="oct">Oktober</option>
              <option value="nov">November</option>
              <option value="dec">Desember</option>
            </select>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {["All", "Last Week"].map((f, i) => (
                <button key={i} onClick={() => setActiveFilter(i)} className={clsx(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeFilter === i ? "bg-white text-[#1e293b] shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}>
                  {f}
                </button>
              ))}
            </div>
            <select 
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:border-[#10b981]"
            >
              <option value="10">10 Data</option>
              <option value="25">25 Data</option>
              <option value="50">50 Data</option>
              <option value="100">100 Data</option>
            </select>
            <button 
              onClick={() => {
                setAddForm({ id_konten: "", name: "", uploadDate: "", evalDate: "", views: "", likes: "", comments: "", shares: "", favs: "", statusUpload: "Uploaded" });
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#122C28] text-white text-xs font-bold rounded-xl hover:bg-[#1B3C37] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-4 py-4">Nama Konten</th>
                <th className="px-4 py-4">Tgl Upload</th>
                <th className="px-4 py-4">Tgl Evaluasi</th>
                <th className="px-4 py-4">Views</th>
                <th className="px-4 py-4">Likes</th>
                <th className="px-4 py-4">Komentar</th>
                <th className="px-4 py-4">Share</th>
                <th className="px-4 py-4">Favorit</th>
                <th className="px-4 py-4">ER</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-[#10b981] animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Memuat data evaluasi...</p>
                  </td>
                </tr>
              ) : kontenList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-gray-400 font-medium">Belum ada data konten</td>
                </tr>
              ) : (
                kontenList.map((konten) => {
                  const evalData = konten.evaluasi?.[0];
                  const er = evalData?.nilai_er ? (Number(evalData.nilai_er)).toFixed(2) + "%" : "0.00%";
                  const erVal = evalData?.nilai_er ? Number(evalData.nilai_er) : 0;
                  const erType = erVal > 10 ? "good" : erVal > 5 ? "average" : erVal > 0 ? "average" : "none";

                  return (
                    <tr key={konten.id_konten} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-[#1e293b]">{konten.nama_konten}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                        {konten.tanggal_upload ? new Date(konten.tanggal_upload).toLocaleDateString('id-ID') : "-"}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                        {evalData?.tanggal_evaluasi ? new Date(evalData.tanggal_evaluasi).toLocaleDateString('id-ID') : "-"}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#1e293b] font-bold">{evalData?.total_views || 0}</td>
                      <td className="px-4 py-4 text-xs text-[#1e293b] font-bold">{evalData?.total_likes || 0}</td>
                      <td className="px-4 py-4 text-xs text-[#1e293b] font-bold">{evalData?.total_comment || 0}</td>
                      <td className="px-4 py-4 text-xs text-[#1e293b] font-bold">{evalData?.total_shares || 0}</td>
                      <td className="px-4 py-4 text-xs text-[#1e293b] font-bold">{evalData?.total_favorites || 0}</td>
                      <td className="px-4 py-4">
                        <span className={clsx(
                          "px-3 py-1 rounded-md text-[10px] font-bold",
                          erType === "good" && "bg-[#ccfbf1] text-[#0f766e]",
                          erType === "average" && "bg-[#dcfce7] text-[#166534]",
                          erType === "none" && "bg-[#fee2e2] text-[#991b1b]",
                        )}>
                          {er}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(konten)}
                            className="p-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(konten)}
                            className="p-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Data Evaluasi Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="max-w-xl">
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#1e293b] mb-6">Edit Data Evaluasi</h2>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Nama Konten *</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all bg-gray-50"
                value={editForm.name}
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Tanggal Upload</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.uploadDate}
                  onChange={(e) => setEditForm({...editForm, uploadDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Tanggal Evaluasi</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.evalDate}
                  onChange={(e) => setEditForm({...editForm, evalDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Total View</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.views}
                  onChange={(e) => setEditForm({...editForm, views: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Total Likes</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.likes}
                  onChange={(e) => setEditForm({...editForm, likes: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Komentar</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.comments}
                  onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Share</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.shares}
                  onChange={(e) => setEditForm({...editForm, shares: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Favorit</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.favs}
                  onChange={(e) => setEditForm({...editForm, favs: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Status Upload</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none appearance-none cursor-pointer"
                  value={editForm.statusUpload}
                  onChange={(e) => setEditForm({...editForm, statusUpload: e.target.value})}
                >
                  {statusUploadOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* ER computed */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">
                ER dihitung otomatis: (Likes + Komentar + Share + Favorit) / Views × 100 = <span className="font-bold text-[#10b981]">{computeER(editForm)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end mt-8 pt-6 border-t border-gray-100 gap-3">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="px-6 py-2.5 border border-gray-200 text-[#1e293b] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleSaveEdit}
              className="px-6 py-2.5 bg-[#122C28] text-white rounded-xl text-sm font-bold hover:bg-[#1B3C37] transition-all"
            >
              Simpan Data
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Evaluasi Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="max-w-xl">
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#1e293b] mb-6">Tambah Data Evaluasi</h2>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Pilih Konten *</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                value={addForm.id_konten}
                onChange={(e) => {
                  const k = kontenList.find(item => item.id_konten.toString() === e.target.value);
                  setAddForm({
                    ...addForm, 
                    id_konten: e.target.value,
                    uploadDate: k?.tanggal_upload ? new Date(k.tanggal_upload).toISOString().split('T')[0] : ""
                  });
                }}
              >
                <option value="">Pilih Konten...</option>
                {kontenList.map(k => (
                  <option key={k.id_konten} value={k.id_konten.toString()}>{k.nama_konten}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Tanggal Upload</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={addForm.uploadDate}
                  onChange={(e) => setAddForm({...addForm, uploadDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Tanggal Evaluasi</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={addForm.evalDate}
                  onChange={(e) => setAddForm({...addForm, evalDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Total View</label>
                <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all" value={addForm.views} onChange={(e) => setAddForm({...addForm, views: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Total Likes</label>
                <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all" value={addForm.likes} onChange={(e) => setAddForm({...addForm, likes: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Komentar</label>
                <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all" value={addForm.comments} onChange={(e) => setAddForm({...addForm, comments: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Share</label>
                <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all" value={addForm.shares} onChange={(e) => setAddForm({...addForm, shares: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Favorit</label>
                <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all" value={addForm.favs} onChange={(e) => setAddForm({...addForm, favs: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Status Upload</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none appearance-none cursor-pointer"
                  value={addForm.statusUpload}
                  onChange={(e) => setAddForm({...addForm, statusUpload: e.target.value})}
                >
                  {statusUploadOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">
                ER dihitung otomatis: (Likes + Komentar + Share + Favorit) / Views × 100 = <span className="font-bold text-[#10b981]">{computeER(addForm)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end mt-8 pt-6 border-t border-gray-100 gap-3">
            <button onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 border border-gray-200 text-[#1e293b] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Batal</button>
            <button onClick={handleSaveAdd} className="px-6 py-2.5 bg-[#122C28] text-white rounded-xl text-sm font-bold hover:bg-[#1B3C37] transition-all">Simpan Data</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        icon={<Trash2 className="w-7 h-7 text-[#ef4444]" />}
        title="Hapus Data Evaluasi?"
        description="Apakah kamu yakin ingin menghapus data evaluasi ini?"
        subDescription="Data yang sudah dihapus tidak dapat dikembalikan."
        cancelText="Batal"
        confirmText="Ya, Hapus"
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg("")}
        message={successMsg}
      />
    </div>
  );
}
