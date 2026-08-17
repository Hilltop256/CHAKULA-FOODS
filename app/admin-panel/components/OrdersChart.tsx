'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'May 5', orders: 28 },
  { day: 'May 6', orders: 35 },
  { day: 'May 7', orders: 22 },
  { day: 'May 8', orders: 41 },
  { day: 'May 9', orders: 38 },
  { day: 'May 10', orders: 52 },
  { day: 'May 11', orders: 47 },
  { day: 'May 12', orders: 31 },
  { day: 'May 13', orders: 44 },
  { day: 'May 14', orders: 58 },
  { day: 'May 15', orders: 49 },
  { day: 'May 16', orders: 36 },
  { day: 'May 17', orders: 62 },
  { day: 'May 18', orders: 47 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-base shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary font-bold">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

export default function OrdersChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="orders"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#ordersGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}