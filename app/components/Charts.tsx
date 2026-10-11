// @ts-nocheck
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function InvestmentPieChart({ acoes, fiis, dolar }: { acoes: number; fiis: number; dolar: number }) {
  const data = [
    { name: 'Ações', value: Number(acoes) || 0.01 },
    { name: 'FIIs', value: Number(fiis) || 0.01 },
    { name: 'Dólar', value: Number(dolar) || 0.01 },
  ];

  const total = acoes + fiis + dolar;

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            <Cell fill="#0B1F33" />
            <Cell fill="#A9823A" />
            <Cell fill="#2F6B57" />
          </Pie>
          <Tooltip
            formatter={(value) => [formatBRL(Number(value)), 'Valor']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0B1F33]"></div>
          <span className="text-xs text-[#707780]">Ações ({total > 0 ? ((acoes / total) * 100).toFixed(0) : 0}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A9823A]"></div>
          <span className="text-xs text-[#707780]">FIIs ({total > 0 ? ((fiis / total) * 100).toFixed(0) : 0}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2F6B57]"></div>
          <span className="text-xs text-[#707780]">Dólar ({total > 0 ? ((dolar / total) * 100).toFixed(0) : 0}%)</span>
        </div>
      </div>
    </div>
  );
}

export function ExpenseBarChart({ data }: { data: { name: string; value: number }[] }) {
  const COLORS = ['#0B1F33', '#A9823A', '#2F6B57', '#A94B4B', '#B8860B', '#707780', '#C5A45A', '#172a3d'];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tickFormatter={(v) => `R$ ${v}`} fontSize={11} />
        <YAxis type="category" dataKey="name" fontSize={11} width={75} />
        <Tooltip
          formatter={(value) => [formatBRL(Number(value)), 'Gasto']}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}