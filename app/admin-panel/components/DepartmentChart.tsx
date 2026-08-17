'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const data = [
  { name: 'Restaurant', value: 42 },
  { name: 'Confectionary', value: 18 },
  { name: 'Juice Bar', value: 15 },
  { name: 'Wine & Liquor', value: 14 },
  { name: 'Market', value: 11 },
];

const COLORS = ['var(--primary)', 'var(--secondary)', '#15803D', 'var(--accent)', '#92400E'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-base shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-primary font-bold">{payload[0].value}% of orders</p>
      </div>
    );
  }
  return null;
};

export default function DepartmentChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`dept-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={8}
          iconType="circle"
          formatter={(value) => (
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}