import { ReactNode } from "react";

interface DashboardMetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  valueClassName?: string;
  children?: ReactNode; // For custom content like Progress bar
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon,
  valueClassName = "",
  children,
}: DashboardMetricCardProps) {
  return (
    <div className="rounded-lg border p-6 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
      {children}
      {subtitle && <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{subtitle}</div>}
    </div>
  );
} 