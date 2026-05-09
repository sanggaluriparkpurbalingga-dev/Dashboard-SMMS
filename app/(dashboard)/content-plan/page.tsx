"use client";

import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { Modal } from "@/components/ui/Modal";
import { SuccessDialog } from "@/components/ui/SuccessDialog";
import { getKonten, createKonten, updateKonten, deleteKonten } from "@/lib/services/konten";
import { Loader2 } from "lucide-react";

// Initial columns structure without mock data
const columnTitles = ["Awareness", "Consideration", "Conversion"];

const pillarOptions = ["Awareness", "Consideration", "Conversion"];
const formatOptions = ["Reels", "Feed", "Story", "TikTok Video", "Carousel", "Short Video"];
const statusOptions = ["Uploaded", "Unuploaded", "Pending", "Cancelled"];

interface ContentItem {
  id: number;
  title: string;
  date: string;
  time: string;
  status: string;
  format: string;
  pillar: string;
  description: string;
  link?: string;
  tanggal_upload?: string | Date;
}

export default function ContentPlanPage() {
  const [columns, setColumns] = useState<{title: string, items: any[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPillar, setAddPillar] = useState("Awareness");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const workspaceId = localStorage.getItem("active_workspace_id");
      if (!workspaceId) return;

      const data = await getKonten(workspaceId);
      
      // Group data by pillar
      const grouped = columnTitles.map(title => ({
        title,
        items: data.filter((item: any) => 
          item.pillar?.toLowerCase() === title.toLowerCase()
        ).map((item: any) => ({
          ...item,
          id: item.id_konten,
          title: item.nama_konten,
          date: item.tanggal_upload ? new Date(item.tanggal_upload).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-",
          time: item.tanggal_upload ? new Date(item.tanggal_upload).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
          status: item.status_konten ? item.status_konten.charAt(0).toUpperCase() + item.status_konten.slice(1) : "Pending",
          format: item.jenis_konten || "Reels",
          pillar: item.pillar ? item.pillar.charAt(0).toUpperCase() + item.pillar.slice(1) : title,
          description: item.deskripsi_konten || "",
          link: item.link_konten || ""
        }))
      }));
      
      setColumns(grouped);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "", pillar: "", format: "", date: "", time: "", status: "", description: "", link: ""
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    title: "", pillar: "Awareness", format: "Reels", date: "", time: "", status: "Pending", description: "", link: ""
  });

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title,
      pillar: item.pillar,
      format: item.format,
      date: item.tanggal_upload ? new Date(item.tanggal_upload).toISOString().split('T')[0] : "",
      time: item.tanggal_upload ? new Date(item.tanggal_upload).toTimeString().split(' ')[0].substring(0, 5) : "",
      status: item.status,
      description: item.description,
      link: item.link || "",
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    
    try {
      const dateTime = editForm.date && editForm.time ? new Date(`${editForm.date}T${editForm.time}`) : null;
      
      await updateKonten(selectedItem.id, {
        nama_konten: editForm.title,
        pillar: editForm.pillar.toLowerCase(),
        status_konten: editForm.status.toLowerCase(),
        jenis_konten: editForm.format,
        tanggal_upload: dateTime,
        deskripsi_konten: editForm.description,
        link_konten: editForm.link
      });

      setIsEditOpen(false);
      setSuccessMsg("Data konten kamu telah berhasil diperbarui ke dalam sistem SanggaluriMS");
      fetchData();
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Gagal memperbarui konten");
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedItem) return;

    try {
      await deleteKonten(selectedItem.id);
      setIsEditOpen(false);
      setSuccessMsg("Berhasil Dihapus!\nKonten yang kamu pilih sudah berhasil dihapus dari sistem.");
      fetchData();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Gagal menghapus konten");
    }
  };

  const handleAddClick = (pillar: string) => {
    setAddPillar(pillar);
    setAddForm({ ...addForm, pillar, title: "", format: "Reels", date: "", time: "", status: "Pending", description: "", link: "" });
    setIsAddOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      const workspaceId = localStorage.getItem("active_workspace_id");
      if (!workspaceId) return;

      const dateTime = addForm.date && addForm.time ? new Date(`${addForm.date}T${addForm.time}`) : null;

      await createKonten({
        id_workspace: Number(workspaceId),
        nama_konten: addForm.title,
        pillar: addForm.pillar.toLowerCase(),
        status_konten: addForm.status.toLowerCase(),
        jenis_konten: addForm.format,
        tanggal_upload: dateTime,
        deskripsi_konten: addForm.description,
        link_konten: addForm.link
      });

      setIsAddOpen(false);
      setSuccessMsg("Data konten kamu telah berhasil ditambahkan ke dalam sistem SanggaluriMS");
      fetchData();
    } catch (error) {
      console.error("Error adding content:", error);
      alert("Gagal menambahkan konten");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-extrabold text-[#1e293b]">Content Plan</h1>
        <span className="px-3 py-1 bg-[#ccfbf1] text-[#0f766e] text-xs font-bold rounded-full">TikTok</span>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
          <p className="text-sm font-medium text-gray-500">Memuat data konten...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-fit">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="font-bold text-gray-400 text-sm">{column.title}</h3>
              <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{column.items.length}</span>
            </div>

            <div className="space-y-4">
              {column.items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleCardClick(item)}
                  className="p-5 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:border-[#10b981]/20"
                >
                  <h4 className="font-bold text-[#1e293b] text-sm group-hover:text-[#10b981] transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">{item.date} · {item.time}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className={clsx(
                      "text-[9px] font-bold px-2.5 py-1 rounded-md",
                      item.status === "Uploaded" && "bg-[#ccfbf1] text-[#0f766e]",
                      item.status === "Pending" && "bg-[#fef3c7] text-[#92400e]",
                      item.status === "Unuploaded" && "bg-[#fee2e2] text-[#991b1b]",
                      item.status === "Cancelled" && "bg-gray-100 text-gray-500",
                    )}>
                      {item.status}
                    </span>
                    <span className="text-[9px] font-bold text-[#6366f1] uppercase tracking-tighter">{item.format}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleAddClick(column.title)}
              className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-[#10b981] transition-colors py-2 group"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ide</span>
            </button>
          </div>
        ))}
      </div>
      )}

      {/* Detail / Edit Konten Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="max-w-xl">
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#1e293b] mb-6">Detail / Edit Konten</h2>

          <div className="space-y-5">
            {/* Nama Konten */}
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Nama Konten *</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>

            {/* Link Konten */}
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Link Konten</label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all placeholder:text-gray-300"
                value={editForm.link}
                onChange={(e) => setEditForm({...editForm, link: e.target.value})}
              />
            </div>

            {/* Pilar + Format */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Pilar Konten *</label>
                <select
                  className="w-full px-4 py-3 bg-[#122C28] text-white rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  value={editForm.pillar}
                  onChange={(e) => setEditForm({...editForm, pillar: e.target.value})}
                >
                  {pillarOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Format Konten</label>
                <select
                  className="w-full px-4 py-3 bg-[#122C28] text-white rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  value={editForm.format}
                  onChange={(e) => setEditForm({...editForm, format: e.target.value})}
                >
                  {formatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Jadwal + Jam */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Jadwal Upload</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Jam Upload</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={editForm.time}
                  onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Status Saat Ini</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none appearance-none cursor-pointer focus:border-[#10b981] transition-all"
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Brief / Deskripsi</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none resize-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleDeleteContent}
              className="px-6 py-2.5 border border-[#ef4444]/20 text-[#ef4444] rounded-xl text-sm font-bold hover:bg-[#fef2f2] transition-all"
            >
              Hapus Konten
            </button>
            <div className="flex gap-3">
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
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add New Konten Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="max-w-xl">
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#1e293b] mb-6">Tambah Ide Konten</h2>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Nama Konten *</label>
              <input
                type="text"
                placeholder="Masukkan judul konten..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all placeholder:text-gray-300"
                value={addForm.title}
                onChange={(e) => setAddForm({...addForm, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Link Konten</label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all placeholder:text-gray-300"
                value={addForm.link}
                onChange={(e) => setAddForm({...addForm, link: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Pilar Konten *</label>
                <select
                  className="w-full px-4 py-3 bg-[#122C28] text-white rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  value={addForm.pillar}
                  onChange={(e) => setAddForm({...addForm, pillar: e.target.value})}
                >
                  {pillarOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Format Konten</label>
                <select
                  className="w-full px-4 py-3 bg-[#122C28] text-white rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  value={addForm.format}
                  onChange={(e) => setAddForm({...addForm, format: e.target.value})}
                >
                  {formatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10b981] mb-1.5 block">Jadwal Upload</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={addForm.date}
                  onChange={(e) => setAddForm({...addForm, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Jam Upload</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#10b981] transition-all"
                  value={addForm.time}
                  onChange={(e) => setAddForm({...addForm, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Status Saat Ini</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none appearance-none cursor-pointer"
                value={addForm.status}
                onChange={(e) => setAddForm({...addForm, status: e.target.value})}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748b] mb-1.5 block">Brief / Deskripsi</label>
              <textarea
                rows={3}
                placeholder="Deskripsikan ide konten..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#1e293b] outline-none resize-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30 transition-all placeholder:text-gray-300"
                value={addForm.description}
                onChange={(e) => setAddForm({...addForm, description: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-end mt-8 pt-6 border-t border-gray-100 gap-3">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="px-6 py-2.5 border border-gray-200 text-[#1e293b] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleSaveAdd}
              className="px-6 py-2.5 bg-[#122C28] text-white rounded-xl text-sm font-bold hover:bg-[#1B3C37] transition-all"
            >
              Simpan Konten
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg("")}
        message={successMsg}
      />
    </div>
  );
}
