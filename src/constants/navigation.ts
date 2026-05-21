import {
  ArchiveBoxIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export const navigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Equipments', href: '/app/equipments', icon: ArchiveBoxIcon },
  { name: 'Employees', href: '/app/employees', icon: UsersIcon },
  { name: 'Reports', href: '/app/reports', icon: DocumentChartBarIcon },
  { name: 'Analytics', href: '/app?focus=analytics', icon: ChartBarSquareIcon },
  { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
];
