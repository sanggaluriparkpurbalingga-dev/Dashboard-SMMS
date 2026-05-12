"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { getKonten } from "@/lib/services/konten";

const DAY_NAMES = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DAY_NAMES_FULL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-start: Mon=0, Tue=1, ..., Sun=6
  return day === 0 ? 6 : day - 1;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [kontenList, setKontenList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const workspaceId = localStorage.getItem("active_workspace_id");
      if (workspaceId) {
        const data = await getKonten(workspaceId);
        setKontenList(data || []);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    kontenList.forEach(item => {
      if (!item.tanggal_upload) return;
      const date = new Date(item.tanggal_upload);
      const key = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        title: item.nama_konten,
        pillar: item.pillar || 'Awareness',
        contentType: item.jenis_konten || 'Video',
        description: item.deskripsi || '-',
        contentLink: item.link_konten,
        status: item.status_konten || 'Pending'
      });
    });
    return grouped;
  }, [kontenList]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  // Get status dots for a day
  const getStatusDots = (day: number) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    const events = eventsByDate[key];
    if (!events) return [];
    const statuses = new Set(events.map((e) => e.status.toLowerCase()));
    const dots: string[] = [];
    if (statuses.has("pending")) dots.push("#f59e0b");
    if (statuses.has("unuploaded")) dots.push("#ef4444");
    if (statuses.has("uploaded")) dots.push("#10b981");
    if (statuses.has("cancelled")) dots.push("#64748b");
    return dots;
  };

  // Selected day events
  const selectedDateKey = selectedDay
    ? formatDateKey(currentYear, currentMonth, selectedDay)
    : null;
  const selectedEvents = selectedDateKey
    ? eventsByDate[selectedDateKey] || []
    : [];

  // Full day name for selected day
  const selectedDayName = selectedDay
    ? DAY_NAMES_FULL[new Date(currentYear, currentMonth, selectedDay).getDay()]
    : "";

  // Build calendar grid
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOffset, daysInMonth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#1e293b]">Calendar</h1>
          <span className="px-3 py-1 bg-[#ccfbf1] text-[#0f766e] text-xs font-bold rounded-full">
            TikTok
          </span>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-xs font-bold text-gray-500">
          {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-[#1e293b]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold text-[#1e293b] hover:bg-gray-50 transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 text-gray-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {calendarCells.map((day, idx) => {
            if (day === null)
              return <div key={`blank-${idx}`} className="h-24" />;

            const isSelected = selectedDay === day;
            const dots = getStatusDots(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={clsx(
                  "h-24 p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group",
                  isSelected
                    ? "bg-[#ccfbf1]/30 border-[#10b981] ring-1 ring-[#10b981]"
                    : "bg-white border-gray-100 hover:border-[#10b981]/30 hover:shadow-sm",
                )}
              >
                <span
                  className={clsx(
                    "text-sm font-bold",
                    isSelected ? "text-[#10b981]" : "text-gray-600",
                  )}
                >
                  {day}
                </span>

                {dots.length > 0 && (
                  <div className="flex gap-1">
                    {dots.map((color, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-8 border-t border-gray-50 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Uploaded
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Unuploaded
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Pending
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#64748b]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Day Details */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        {selectedDay && selectedEvents.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1e293b]">
                {selectedDayName}, {selectedDay} {MONTH_NAMES[currentMonth]}{" "}
                {currentYear}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {selectedEvents.length} konten dijadwalkan
              </p>
            </div>

            <div className="space-y-4">
              {selectedEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-6 rounded-2xl border border-gray-50 hover:bg-gray-50/30 transition-all"
                >
                  <div className="flex items-start gap-6">
                    <span className="text-sm font-bold text-[#1e293b] w-12 shrink-0">
                      {event.time}
                    </span>
                    <div>
                      <h4 className="font-bold text-[#1e293b] text-base mb-1">
                        {event.contentLink ? (
                          <a
                            href={event.contentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#10b981] hover:underline"
                          >
                            {event.title}
                          </a>
                        ) : (
                          event.title
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {event.pillar}
                        </span>
                        <span>•</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {event.contentType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      "px-6 py-2 rounded-xl text-xs font-bold border shrink-0 text-center",
                      event.status.toLowerCase() === "uploaded" &&
                      "bg-[#ccfbf1] text-[#0f766e] border-[#0f766e]/10",
                      event.status.toLowerCase() === "pending" &&
                      "bg-[#fef3c7] text-[#92400e] border-[#92400e]/10",
                      event.status.toLowerCase() === "unuploaded" &&
                      "bg-[#fee2e2] text-[#991b1b] border-[#991b1b]/10",
                      event.status.toLowerCase() === "cancelled" &&
                      "bg-gray-100 text-gray-500 border-gray-200",
                    )}
                  >
                    {event.status}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 font-medium">
              {selectedDay
                ? "Tidak ada konten dijadwalkan untuk tanggal ini."
                : "Pilih tanggal untuk melihat detail konten"}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Klik pada tanggal di kalender untuk melihat daftar konten.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
