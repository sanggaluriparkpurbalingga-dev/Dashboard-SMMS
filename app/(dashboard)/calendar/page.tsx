"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

// Mock calendar content data
const mockEvents: Record<
  string,
  {
    time: string;
    title: string;
    pillar: string;
    contentType: string;
    description: string;
    contentLink?: string;
    status: string;
  }[]
> = {
  "2026-04-05": [
    {
      time: "07:00",
      title: "Opening Hour Update",
      pillar: "Awareness",
      contentType: "Story",
      description: "Update jam operasional.",
      status: "Uploaded",
    },
  ],
  "2026-04-18": [
    {
      time: "10:00",
      title: "Mengenal Satwa Lokal",
      pillar: "Awareness",
      contentType: "Carousel",
      description: "Draft konten.",
      status: "Pending",
    },
  ],
  "2026-04-19": [
    {
      time: "10:00",
      title: "Fakta Unik Burung Nuri",
      pillar: "Awareness",
      contentType: "Carousel",
      description: "Konten edukasi tentang burung nuri.",
      status: "Uploaded",
      contentLink: "https://instagram.com/p/123",
    },
    {
      time: "15:00",
      title: "Promo Tiket Rombongan",
      pillar: "Conversion",
      contentType: "Reels",
      description: "Promo diskon tiket rombongan.",
      status: "Pending",
    },
    {
      time: "18:00",
      title: "Behind the Scenes Wahana",
      pillar: "Consideration",
      contentType: "Story",
      description: "BTS wahana baru.",
      status: "Unuploaded",
    },
  ],
  "2026-04-20": [
    {
      time: "10:00",
      title: "Sejarah Sanggaluri",
      pillar: "Awareness",
      contentType: "Reels",
      description: "Sejarah berdiri.",
      status: "Pending",
    },
    {
      time: "14:00",
      title: "Flash Sale Weekend",
      pillar: "Conversion",
      contentType: "Story",
      description: "Flash sale.",
      status: "Unuploaded",
    },
  ],
  "2026-04-22": [
    {
      time: "09:00",
      title: "Tips Foto di Sanggaluri",
      pillar: "Consideration",
      contentType: "Carousel",
      description: "Spot foto terbaik.",
      status: "Uploaded",
    },
    {
      time: "16:00",
      title: "Review Pengunjung",
      pillar: "Consideration",
      contentType: "Reels",
      description: "Kompilasi review.",
      status: "Pending",
    },
    {
      time: "11:00",
      title: "Vlog Keseruan Anak SD",
      pillar: "Awareness",
      contentType: "Reels",
      description: "Dokumentasi kunjungan.",
      status: "Unuploaded",
    },
  ],
  "2026-04-23": [
    {
      time: "10:00",
      title: "Fakta Unik Burung Nuri",
      pillar: "Awareness",
      contentType: "Carousel",
      description: "Konten edukasi tentang burung nuri.",
      status: "Uploaded",
    },
    {
      time: "10:00",
      title: "Fakta Unik Burung Nuri",
      pillar: "Awareness",
      contentType: "Carousel",
      description: "Konten edukasi tentang burung nuri.",
      status: "Pending",
    },
    {
      time: "10:00",
      title: "Fakta Unik Burung Nuri",
      pillar: "Awareness",
      contentType: "Carousel",
      description: "Konten edukasi tentang burung nuri.",
      status: "Unuploaded",
    },
    {
      time: "12:00",
      title: "Kuis Tebak Hewan",
      pillar: "Awareness",
      contentType: "Story",
      description: "Kuis interaktif.",
      status: "Cancelled",
    },
  ],
  "2026-04-24": [
    {
      time: "10:00",
      title: "FAQ Wahana Edukatif",
      pillar: "Consideration",
      contentType: "Carousel",
      description: "FAQ wahana.",
      status: "Pending",
    },
  ],
};

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
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April = 3 (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(23);

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
    setCurrentYear(2026);
    setCurrentMonth(3);
    setSelectedDay(23);
  };

  // Get status dots for a day
  const getStatusDots = (day: number) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    const events = mockEvents[key];
    if (!events) return [];
    const statuses = new Set(events.map((e) => e.status));
    const dots: string[] = [];
    if (statuses.has("Pending")) dots.push("#f59e0b");
    if (statuses.has("Unuploaded")) dots.push("#ef4444");
    if (statuses.has("Uploaded")) dots.push("#10b981");
    return dots;
  };

  // Selected day events
  const selectedDateKey = selectedDay
    ? formatDateKey(currentYear, currentMonth, selectedDay)
    : null;
  const selectedEvents = selectedDateKey
    ? mockEvents[selectedDateKey] || []
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
          Jum, 24 Apr 2026
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
                      event.status === "Uploaded" &&
                      "bg-[#ccfbf1] text-[#0f766e] border-[#0f766e]/10",
                      event.status === "Pending" &&
                      "bg-[#fef3c7] text-[#92400e] border-[#92400e]/10",
                      event.status === "Unuploaded" &&
                      "bg-[#fee2e2] text-[#991b1b] border-[#991b1b]/10",
                      event.status === "Cancelled" &&
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
