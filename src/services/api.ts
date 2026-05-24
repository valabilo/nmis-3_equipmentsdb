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

  const payload = init?.body ? JSON.parse(init.body.toString()) : {};
  const result = await jsonpRequest<T>(action, payload);
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }

  return result;
}

function buildAppsScriptUrl(action: string, payload: Record<string, unknown>, callbackName?: string) {
  if (!API_URL) throw new Error('Missing VITE_GOOGLE_APPS_SCRIPT_URL');
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  if (callbackName) url.searchParams.set('callback', callbackName);

  Object.entries(payload).forEach(([key, value]) => {
    url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  });

  return url.toString();
}

function jsonpRequest<T>(action: string, payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const callbackName = `__equipmentApi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const callbacks = window as unknown as Record<string, unknown>;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('API request timed out'));
    }, 30000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      script.remove();
      delete callbacks[callbackName];
    };

    callbacks[callbackName] = (response: ApiResponse<T>) => {
      cleanup();
      resolve(response);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('API request failed'));
    };
    script.src = buildAppsScriptUrl(action, payload, callbackName);
    document.head.appendChild(script);
  });
}

async function writeOnlyRequest(action: string, payload: Record<string, unknown>) {
  await fetch(buildAppsScriptUrl(action, payload), {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-store',
  });
}

async function mockRequest<T>(action: string, init?: RequestInit): Promise<ApiResponse<T>> {
  await new Promise((resolve) => window.setTimeout(resolve, 260));
  const payload = init?.body ? JSON.parse(init.body.toString()) : {};

  switch (action) {
    case 'getEmployees':
      return { success: true, message: 'Employees loaded', data: mockEmployees.map(normalizeEmployee) as T };
    case 'createEmployee': {
      const employee = normalizeEmployee(payload.employee);
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
        mockEmployees[index] = normalizeEmployee({ ...mockEmployees[index], ...employee });
        if (previousName !== mockEmployees[index].name) {
          mockEquipments.forEach((item) => {
            if (item.issuedTo === previousName) item.issuedTo = mockEmployees[index].name;
          });
        }
      }
      return { success: true, message: 'Employee updated successfully', data: mockEmployees[index] as T };
    }
    case 'deleteEmployee': {
      const employee = payload.employee as Employee;
      const index = mockEmployees.findIndex((item) => item.employeeId === employee.employeeId);
      if (index >= 0) {
        const previousName = mockEmployees[index].name;
        mockEmployees.splice(index, 1);
        mockEquipments.forEach((item) => {
          if (item.issuedTo === previousName) item.issuedTo = '';
        });
      }
      return { success: true, message: 'Employee deleted successfully', data: employee.employeeId as T };
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
  getEmployees: () => request<Employee[]>('getEmployees').then((response) => response.data.map(normalizeEmployee)),
  createEmployee: (employee: EmployeePayload) =>
    request<Employee>('createEmployee', {
      method: 'POST',
      body: JSON.stringify({ employee }),
    }).then((response) => normalizeEmployee(response.data)),
  updateEmployee: (employee: EmployeePayload, previousEmployee?: Employee) =>
    request<Employee>('updateEmployee', {
      method: 'POST',
      body: JSON.stringify({ employee, previousEmployee }),
    })
      .catch(async (error) => {
        if (!(error instanceof Error) || error.message !== 'API request failed') throw error;
        await writeOnlyRequest('updateEmployee', { employee, previousEmployee });
        const employees = await api.getEmployees();
        const updated = employees.find((item) => item.employeeId === normalizeEmployee(employee).employeeId);
        if (!updated) throw new Error('Employee update did not persist: employeeId');
        return { success: true, message: 'Employee updated successfully', data: updated };
      })
      .then((response) => {
        const updated = normalizeEmployee(response.data);
        assertEmployeePersisted(employee, updated);
        return updated;
      }),
  deleteEmployee: (employee: Employee) =>
    request<string>('deleteEmployee', {
      method: 'POST',
      body: JSON.stringify({ employee }),
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
      method: 'POST',
      body: JSON.stringify({ equipment }),
    }).then((response) => response.data),
  deleteEquipment: (id: string) =>
    request<string>('deleteEquipment', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }).then((response) => response.data),
};

function normalizeEmployee(employee: EmployeePayload): Employee {
  return {
    employeeId: String(employee.employeeId ?? '').trim(),
    name: String(employee.name ?? '').trim(),
    position: String(employee.position ?? '').trim(),
    status: String(employee.status ?? '').trim() || 'Active',
  };
}

function assertEmployeePersisted(expectedEmployee: EmployeePayload, updatedEmployee: Employee) {
  const expected = normalizeEmployee(expectedEmployee);
  const mismatchedFields = (['employeeId', 'name', 'position', 'status'] as const).filter((field) => expected[field] !== updatedEmployee[field]);

  if (mismatchedFields.length) {
    throw new Error(`Employee update did not persist: ${mismatchedFields.join(', ')}`);
  }
}
