import { mockEmployees, mockEquipments } from './mockData';
import type { ApiResponse, Employee, EmployeePayload, Equipment, EquipmentPayload } from '../types';

const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;
const USE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== 'false';

async function request<T>(action: string, init?: RequestInit): Promise<ApiResponse<T>> {
  if (!API_URL && USE_MOCKS) {
    return mockRequest<T>(action, init);
  }

  if (!API_URL) {
    throw new Error('Missing VITE_GOOGLE_APPS_SCRIPT_URL');
  }

  const method = init?.method ?? 'GET';
  const url = method === 'GET' ? `${API_URL}?action=${action}` : API_URL;
  const body =
    method === 'GET'
      ? undefined
      : JSON.stringify({
          action,
          ...(init?.body ? JSON.parse(init.body.toString()) : {}),
        });

  const response = await fetch(url, {
    ...init,
    method,
    body,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

async function mockRequest<T>(action: string, init?: RequestInit): Promise<ApiResponse<T>> {
  await new Promise((resolve) => window.setTimeout(resolve, 260));
  const payload = init?.body ? JSON.parse(init.body.toString()) : {};

  switch (action) {
    case 'getEmployees':
      return { success: true, message: 'Employees loaded', data: mockEmployees as T };
    case 'createEmployee': {
      const employee: Employee = {
        ...payload.employee,
        employeeId: String(payload.employee.employeeId ?? '').trim(),
        name: String(payload.employee.name ?? '').trim(),
        position: String(payload.employee.position ?? '').trim(),
        status: String(payload.employee.status ?? '').trim() || 'Active',
      };
      mockEmployees.unshift(employee);
      return { success: true, message: 'Employee created successfully', data: employee as T };
    }
    case 'updateEmployee': {
      const previousEmployee = payload.previousEmployee as Employee | undefined;
      const employee = payload.employee as Employee;
      const lookupId = previousEmployee?.employeeId ?? employee.employeeId;
      const index = mockEmployees.findIndex((item) => item.employeeId === lookupId);
      if (index >= 0) {
        const previousName = mockEmployees[index].name;
        mockEmployees[index] = {
          ...mockEmployees[index],
          ...employee,
          employeeId: String(employee.employeeId ?? '').trim(),
          name: String(employee.name ?? '').trim(),
          position: String(employee.position ?? '').trim(),
          status: String(employee.status ?? '').trim() || 'Active',
        };
        if (previousName !== mockEmployees[index].name) {
          mockEquipments.forEach((item) => {
            if (item.issuedTo === previousName) item.issuedTo = mockEmployees[index].name;
          });
        }
      }
      return { success: true, message: 'Employee updated successfully', data: mockEmployees[index] as T };
    }
    case 'getEquipments':
      return { success: true, message: 'Equipments loaded', data: mockEquipments as T };
    case 'getEquipmentByEmployee':
      return {
        success: true,
        message: 'Employee equipment loaded',
        data: mockEquipments.filter((item) => item.issuedTo === payload.employeeName) as T,
      };
    case 'createEquipment': {
      const item: Equipment = {
        ...payload.equipment,
        id: crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
      };
      mockEquipments.unshift(item);
      return { success: true, message: 'Equipment created successfully', data: item as T };
    }
    case 'updateEquipment': {
      const index = mockEquipments.findIndex((item) => item.id === payload.equipment.id);
      if (index >= 0) {
        mockEquipments[index] = { ...mockEquipments[index], ...payload.equipment, updatedAt: new Date().toISOString() };
      }
      return { success: true, message: 'Equipment updated successfully', data: mockEquipments[index] as T };
    }
    case 'deleteEquipment': {
      const index = mockEquipments.findIndex((item) => item.id === payload.id);
      if (index >= 0) mockEquipments.splice(index, 1);
      return { success: true, message: 'Equipment deleted successfully', data: payload.id as T };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export const api = {
  getEmployees: () => request<Employee[]>('getEmployees').then((response) => response.data),
  createEmployee: (employee: EmployeePayload) =>
    request<Employee>('createEmployee', {
      method: 'POST',
      body: JSON.stringify({ employee }),
    }).then((response) => response.data),
  updateEmployee: (employee: EmployeePayload, previousEmployee?: Employee) =>
    request<Employee>('updateEmployee', {
      method: 'PUT',
      body: JSON.stringify({ employee, previousEmployee }),
    }).then((response) => response.data),
  getEquipments: () => request<Equipment[]>('getEquipments').then((response) => response.data),
  getEquipmentByEmployee: (employeeName: string) =>
    request<Equipment[]>('getEquipmentByEmployee', {
      method: 'POST',
      body: JSON.stringify({ employeeName }),
    }).then((response) => response.data),
  createEquipment: (equipment: EquipmentPayload) =>
    request<Equipment>('createEquipment', {
      method: 'POST',
      body: JSON.stringify({ equipment }),
    }).then((response) => response.data),
  updateEquipment: (equipment: EquipmentPayload & { id: string }) =>
    request<Equipment>('updateEquipment', {
      method: 'PUT',
      body: JSON.stringify({ equipment }),
    }).then((response) => response.data),
  deleteEquipment: (id: string) =>
    request<string>('deleteEquipment', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }).then((response) => response.data),
};
