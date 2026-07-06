"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ======================
// CONFIG
// ======================
const colors = ["#5DA832", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4"];
const chartGridColor = "#1e293b";
const chartTextColor = "#94a3b8";

// ======================
// FORMATADOR
// ======================
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// ======================
// HOOK MOBILE
// ======================
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

// ======================
// TOOLTIP
// ======================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 border border-slate-700/60 rounded-lg p-3 shadow-xl">
        {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}

        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ======================
// CATEGORY PIE (CORRIGIDO)
// ======================
export function CategoryPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const isMobile = useIsMobile();

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((acc, item) => acc + item.value, 0);

  // MOBILE
  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* CHART */}
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sorted}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                innerRadius={50}
                stroke="none"
              >
                {sorted.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGENDA */}
        <div className="w-full flex flex-col gap-3">
          {sorted.map((item, index) => {
            const percent = total ? (item.value / total) * 100 : 0;

            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-slate-300">{item.name}</span>
                </div>

                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {percent.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DESKTOP
  return (
    <div className="w-full flex flex-row items-center gap-6">
      {/* CHART */}
      <div className="w-1/2 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={55}
              stroke="none"
            >
              {sorted.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGENDA */}
      <div className="w-1/2 flex flex-col gap-3">
        {sorted.map((item, index) => {
          const percent = total ? (item.value / total) * 100 : 0;

          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-slate-300">{item.name}</span>
              </div>

              <div className="text-right">
                <div className="text-white font-medium">
                  {formatCurrency(item.value)}
                </div>
                <div className="text-xs text-slate-400">
                  {percent.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================
// LINE CHART
// ======================
export function EvolutionChart({ data }: any) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.5} />

        <XAxis
          dataKey="mes"
          tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
          stroke={chartGridColor}
        />

        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
          stroke={chartGridColor}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend wrapperStyle={{ color: chartTextColor }} />

        <Line type="monotone" dataKey="receitas" stroke="#10b981" />
        <Line type="monotone" dataKey="despesas" stroke="#f43f5e" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ======================
// LINE CHART — EVOLUÇÃO DE INVESTIMENTOS
// ======================
export function InvestimentoEvolutionChart({ data }: { data: { mes: string; saldo: number }[] }) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.5} />

        <XAxis
          dataKey="mes"
          tick={{ fill: chartTextColor, fontSize: isMobile ? 11 : 13 }}
          stroke={chartGridColor}
        />

        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: chartTextColor, fontSize: isMobile ? 11 : 13 }}
          stroke={chartGridColor}
          width={isMobile ? 60 : 80}
        />

        <Tooltip content={<CustomTooltip />} />

        <Line
          type="monotone"
          dataKey="saldo"
          name="Patrimônio"
          stroke="#5DA832"
          strokeWidth={2}
          dot={{ fill: "#5DA832", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ======================
// BAR CHART
// ======================
export function DreChart({ data }: any) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.5} />

        <XAxis
          dataKey="mes"
          tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
          stroke={chartGridColor}
        />

        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
          stroke={chartGridColor}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend wrapperStyle={{ color: chartTextColor }} />

        <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
