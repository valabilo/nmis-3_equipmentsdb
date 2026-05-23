export type Theme = 'light' | 'dark' | 'system';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PersonnelStatus = 'Active' | 'Inactive' | 'Retired' | 'Transferred' | string;

export type Employee = {
  employeeId: string;
  name: string;
  status: PersonnelStatus;
  position: string;
};

export type EmployeePayload = Employee;

export type EquipmentCategory =
  | 'PPE ACCOUNTABILITY'
  | 'SEMI-EXPENDABLE PROPERTY (SE)'
  | 'TECHNICAL AND SCIENTIFIC EQUIPMENTS'
  | 'OFFICE EQUIPMENTS - EXPANDABLES'
  | 'SUPPLIES AND SEMI-EXPENDABLES/OFFICE EQUIPMENT';

export type EquipmentStatus = 'Assigned' | 'Available' | 'Returned' | 'For Repair' | 'Disposed' | string;

export type Equipment = {
  id: string;
  category: EquipmentCategory;
  article: string;
  propertyNo: string;
  itemDescription: string;
  amount: number;
  accountabilityNo: string;
  accountabilityType: 'PAR' | 'ICS';
  issuedTo: string;
  dateIssued: string;
  status: EquipmentStatus;
  location: string;
  remarks: string;
  updatedAt: string;
};

export type EquipmentPayload = Omit<Equipment, 'id' | 'updatedAt'> & {
  id?: string;
};

export type DashboardStats = {
  totalEquipments: number;
  totalAssigned: number;
  totalAvailable: number;
  totalEmployees: number;
  totalValue: number;
};

export type ReportKind = 'inventory' | 'employee' | 'accountability' | 'category';
