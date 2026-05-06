import React from "react";
import { Eye, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  date: string;
  views: string;
  likes: string;
  comments: string;
  status: "Uploaded" | "Unuploaded" | "Pending" | "Cancelled";
  thumbnail: string;
}

interface ContentTableProps {
  title: string;
  items: ContentItem[];
}

export function ContentTable({ title, items }: ContentTableProps) {
  return (
    <div className="bg-card rounded-3xl border border-border-custom shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-custom flex items-center justify-between">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <button className="text-sanggaluri text-sm font-semibold hover:underline">
          Lihat Semua
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Konten</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Metrik</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate max-w-[200px]">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${item.status === "Uploaded" ? "bg-[#ccfbf1] text-[#0f766e]" :
                      item.status === "Pending" ? "bg-[#fef3c7] text-[#92400e]" :
                        item.status === "Unuploaded" ? "bg-[#fee2e2] text-[#991b1b]" :
                          "bg-gray-100 text-gray-500"
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <div className="flex flex-col items-center">
                      <Eye className="w-4 h-4 text-views" />
                      <span className="text-xs font-bold">{item.views}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="w-4 h-4 text-likes" />
                      <span className="text-xs font-bold">{item.likes}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-4 h-4 text-sanggaluri" />
                      <span className="text-xs font-bold">{item.comments}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
