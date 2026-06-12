"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { type ReactNode } from "react";
import {
  type LucideIcon,
  ListChecks,
  Percent,
  BookOpen,
  Target,
  BarChart3,
} from "lucide-react";
import { subjectHex } from "@/lib/constants";
import type { WeeklyTotals, SubjectStat } from "@/lib/types";
import { formatDateShort } from "@/lib/weeks";

const AXIS = { fontSize: 11, fontFamily: "var(--font-mono)", fill: "#a4a094" };
const GRID = "#e8e6de";

function ChartCard({ icon: Icon, title, children, empty }: { icon: LucideIcon; title: string; children: ReactNode; empty?: boolean }) {
  return (
    <div className="rounded-card border border-chalk bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-iris" strokeWidth={2} />
        <h4 className="font-display text-[14px] font-bold text-ink">{title}</h4>
      </div>
      {empty ? (
        <div className="flex h-[180px] items-center justify-center text-[12.5px] text-slate">
          Henüz veri yok
        </div>
      ) : (
        <div className="h-[200px]">{children}</div>
      )}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e8e6de",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(27,26,22,.08)",
};

export function WeeklyQuestionsChart({ data }: { data: WeeklyTotals[] }) {
  return (
    <ChartCard icon={ListChecks} title="Haftalık Çözülen Soru" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(108,92,231,.06)" }} />
          <Bar dataKey="total" name="Toplam soru" fill="#6c5ce7" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SuccessRateChart({ data }: { data: WeeklyTotals[] }) {
  return (
    <ChartCard icon={Percent} title="Haftalık Başarı Yüzdesi" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2fbf91" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2fbf91" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`%${v}`, "Başarı"]} />
          <Area type="monotone" dataKey="successRate" stroke="#2fbf91" strokeWidth={2.5} fill="url(#successGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SubjectSuccessChart({ data }: { data: SubjectStat[] }) {
  return (
    <ChartCard icon={BarChart3} title="Ders Bazlı Başarı" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="subjectName"
            tick={{ ...AXIS, fontSize: 10 }}
            width={92}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`%${v}`, "Başarı"]} cursor={{ fill: "rgba(108,92,231,.06)" }} />
          <Bar dataKey="successRate" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((s) => (
              <Cell key={s.subjectId} fill={subjectHex(s.subjectName)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ExamScoreChart({ data }: { data: { name: string; date: string; score: number }[] }) {
  const chartData = data.map((e) => ({ ...e, label: formatDateShort(e.date) }));
  return (
    <ChartCard icon={Target} title="Deneme Puanı Gelişimi" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={["dataMin - 20", "dataMax + 20"]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Puan"]} />
          <Line type="monotone" dataKey="score" stroke="#ff6b9d" strokeWidth={2.5} dot={{ r: 4, fill: "#ff6b9d" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ReadingChart({ data }: { data: { label: string; pages: number }[] }) {
  return (
    <ChartCard icon={BookOpen} title="Kitap Okuma (Sayfa)" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} sayfa`, "Okuma"]} cursor={{ fill: "rgba(255,159,67,.08)" }} />
          <Bar dataKey="pages" name="Sayfa" fill="#ff9f43" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
