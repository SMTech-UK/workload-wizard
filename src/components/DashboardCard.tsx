// components/DashboardCard.tsx
import React from "react";

export type DashboardCardData = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  order: number; // Add an order property for sorting
};

export function DashboardCard({ title, value, subtitle, icon, highlight }: DashboardCardData) {
  return (
    <div className="rounded-lg border p-6 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {icon}
      </div>
      <div className={`text-3xl font-bold ${highlight ? "text-red-600" : ""}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{subtitle}</div>}
    </div>
  );
}