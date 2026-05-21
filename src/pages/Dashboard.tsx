import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardStats } from '../features/dashboard/DashboardStats';
import { Card } from '../components/ui/Card';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipments } from '../hooks/useEquipment';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useState } from 'react';
import { getEquipmentValue, isEquipmentAssigned, isEquipmentAvailable } from '../utils/equipment';
import { searchEquipment } from '../utils/search';
import { formatCurrency, formatDate } from '../utils/format';

const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
const tooltipStyle = {
  background: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '12px',
  color: 'var(--chart-tooltip-text)',
};
const tooltipTextStyle = { color: 'var(--chart-tooltip-text)' };

export function Dashboard() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query);
  const { data: equipment = [] } = useEquipments();
  const { data: employees = [] } = useEmployees();
  const filtered = searchEquipment(equipment, debounced).slice(0, 5);
  const stats = {
    totalEquipments: equipment.length,
    totalAssigned: equipment.filter(isEquipmentAssigned).length,
    totalAvailable: equipment.filter(isEquipmentAvailable).length,
    totalEmployees: employees.length,
    totalValue: equipment.reduce((sum, item) => sum + getEquipmentValue(item), 0),
  };
  const categoryData = Object.entries(
    equipment.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(
    equipment.reduce<Record<string, number>>((acc, item) => {
      const status = item.status?.trim() || 'No Status';
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <motion.div className="page-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="section-heading">
          <p className="microcopy">Overview</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">Equipment Management Overview</h2>
          <p className="max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
            View inventory totals, accountability records, employee assignments, and equipment status in one workspace.
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search employees, property numbers, locations..." className="w-full md:w-96" />
      </section>
      <DashboardStats stats={stats} />
      <div className="grid gap-3 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:items-center sm:gap-4">
            <div>
              <p className="microcopy">Category Statistics</p>
              <h3 className="mt-1 font-semibold text-zinc-950 dark:text-white">Inventory distribution</h3>
            </div>
            <span className="shrink-0 text-xs text-zinc-500 sm:text-sm">{formatCurrency(stats.totalValue)}</span>
          </div>
          <div className="h-52 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryData}>
                <defs>
                  <linearGradient id="inventory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-trend)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--chart-trend)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} cursor={{ stroke: 'var(--chart-grid)' }} />
                <Area
                  dataKey="value"
                  stroke="var(--chart-trend)"
                  fill="url(#inventory)"
                  strokeWidth={2.5}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--chart-tooltip-bg)', fill: 'var(--chart-trend)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="microcopy">Status Overview</p>
          <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-[0.9fr_1fr] sm:items-center">
            <div className="h-44 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusData.map((item, index) => (
                <div key={item.name || `status-${index}`} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span className="size-2 rounded-full" style={{ background: chartColors[index % chartColors.length] }} />
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <Card className="p-4 sm:p-6">
        <p className="microcopy">Recently Updated Equipments</p>
        <div className="mt-2 divide-y divide-zinc-100 sm:mt-4 dark:divide-zinc-900">
          {(filtered.length ? filtered : equipment.slice(0, 5)).map((item, index) => (
            <div key={item.id || `${item.propertyNo}-${index}`} className="grid gap-2 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950 dark:text-white">{item.article}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 sm:text-sm">{item.propertyNo} - {item.itemDescription}</p>
              </div>
              <Badge tone={item.status}>{item.status || 'No Status'}</Badge>
              <span className="text-sm text-zinc-500">{formatDate(item.updatedAt)}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
