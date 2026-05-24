import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/appStore';
import type { Employee, EmployeePayload } from '../types';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees,
  });
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient();
  const pushToast = useAppStore((state) => state.pushToast);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
      queryClient.invalidateQueries({ queryKey: ['equipments'] }),
    ]);
  };

  return {
    createEmployee: useMutation({
      mutationFn: (employee: EmployeePayload) => api.createEmployee(employee),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Employee added', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Employee was not added', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
    updateEmployee: useMutation({
      mutationFn: ({ employee, previousEmployee }: { employee: EmployeePayload; previousEmployee?: Employee }) =>
        api.updateEmployee(employee, previousEmployee),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Employee updated', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Employee was not updated', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
    deleteEmployee: useMutation({
      mutationFn: (employee: Employee) => api.deleteEmployee(employee),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Employee deleted', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Employee was not deleted', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.';
}
