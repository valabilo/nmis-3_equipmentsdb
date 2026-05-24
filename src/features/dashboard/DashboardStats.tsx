import { motion } from 'framer-motion';
import type { DashboardStats as DashboardStatsType } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Card } from '../../components/ui/Card';

export function DashboardStats({ stats, loading }: { stats: DashboardStatsType; loading?: boolean }) {
  const cards = [
    ['Total Equipments', loading ? 'Loading...' : stats.totalEquipments.toLocaleString()],
    ['Assigned Equipments', loading ? 'Loading...' : stats.totalAssigned.toLocaleString()],
    ['Available Equipments', loading ? 'Loading...' : stats.totalAvailable.toLocaleString()],
    ['Total Employees', loading ? 'Loading...' : stats.totalEmployees.toLocaleString()],
    ['Inventory Value', loading ? 'Loading...' : formatCurrency(stats.totalValue)],
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-5">
      {cards.map(([label, value], index) => (
        <Card key={label} className={`p-4 sm:p-6 ${label === 'Inventory Value' ? 'col-span-2 xl:col-span-1' : ''}`}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <p className="microcopy leading-tight">{label}</p>
            <p className="mt-2 truncate text-xl font-semibold tracking-tight text-zinc-950 sm:mt-3 sm:text-2xl dark:text-white">{value}</p>
          </motion.div>
        </Card>
      ))}
    </div>
  );
}
