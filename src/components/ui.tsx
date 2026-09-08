'use client';

import React from 'react';

export function Card({ children, className }: any) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className || ''}`}>{children}</div>;
}

export function Button({ children, onClick, variant = 'primary', className, type = 'button', disabled }: any) {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 transition-colors";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100",
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className || ''}`}>{children}</button>;
}

export function Badge({ children, variant = 'default', className }: any) {
  const variants: any = {
    default: "bg-slate-100 text-slate-900",
    realized: "bg-green-100 text-green-800",
    projected: "bg-slate-50 text-slate-600 border border-dashed",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    unexpected: "bg-orange-100 text-orange-800",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className || ''}`}>{children}</span>;
}

export function Progress({ value, className }: any) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className || ''}`}>
      <div className="h-full bg-blue-600 transition-all" style={{ width: `${value || 0}%` }} />
    </div>
  );
}

export function Drawer({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl" onClick={(e: any) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="overflow-y-auto p-4 pb-24">{children}</div>
      </div>
    </div>
  );
}

export function Select({ value, onChange, options, label }: any) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select value={value} onChange={(e: any) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}