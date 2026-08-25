import { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-14 h-14 rounded-2xl bg-[#EAF2FB] flex items-center justify-center text-[#2F5D9F] mb-4">
        {icon}
      </div>
      <p className="text-[#1F3E72] font-medium">{title}</p>
      {subtitle && (
        <p className="text-slate-400 text-sm mt-1 max-w-xs">{subtitle}</p>
      )}
    </div>
  );
}
