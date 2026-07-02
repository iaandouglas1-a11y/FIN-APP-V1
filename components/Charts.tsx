"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#5DA832", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4"];
const chartGridColor = "#1e293b";
const chartTextColor = "#94a3b8";
const chartTooltipBg = "#1e293b";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 border border-slate-700/60 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: R$ {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  const isMobile = useIsMobile();
  const height = isMobile ? 280 : 320;
  const radius = isMobile ? 70 : 90;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          nameKey="name" 
          outerRadius={radius} 
          label={!isMobile}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EvolutionChart({ data }: { data: { mes: string; receitas: number; despesas: number; resultado: number }[] }) {
  const isMobile = useIsMobile();
  const height = isMobile ? 280 : 320;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart 
        data={data} 
        margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 0 : 0, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={chartGridColor}
          opacity={0.5}
        />
        <XAxis 
          dataKey="mes" 
          tick={{ fontSize: isMobile ? 12 : 14, fill: chartTextColor }}
          stroke={chartGridColor}
        />
        <YAxis 
          tick={{ fontSize: isMobile ? 12 : 14, fill: chartTextColor }}
          stroke={chartGridColor}
        />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
        />
        <Legend 
          wrapperStyle={{ fontSize: isMobile ? 12 : 14, color: chartTextColor }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="receitas" 
          stroke="#10b981" 
          strokeWidth={2.5}
          dot={!isMobile ? { fill: "#10b981", r: 4 } : false}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
        <Line 
          type="monotone" 
          dataKey="despesas" 
          stroke="#f43f5e" 
          strokeWidth={2.5}
          dot={!isMobile ? { fill: "#f43f5e", r: 4 } : false}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DreChart({ data }: { data: { mes: string; receitas: number; despesas: number; resultado: number }[] }) {
  const isMobile = useIsMobile();
  const height = isMobile ? 280 : 320;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 0 : 0, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={chartGridColor}
          opacity={0.5}
        />
        <XAxis 
          dataKey="mes" 
          tick={{ fontSize: isMobile ? 12 : 14, fill: chartTextColor }}
          stroke={chartGridColor}
        />
        <YAxis 
          tick={{ fontSize: isMobile ? 12 : 14, fill: chartTextColor }}
          stroke={chartGridColor}
        />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
        />
        <Legend 
          wrapperStyle={{ fontSize: isMobile ? 12 : 14, color: chartTextColor }}
        />
        <Bar 
          dataKey="receitas" 
          fill="#10b981" 
          radius={[6, 6, 0, 0]}
          isAnimationActive={true}
        />
        <Bar 
          dataKey="despesas" 
          fill="#f43f5e" 
          radius={[6, 6, 0, 0]}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
