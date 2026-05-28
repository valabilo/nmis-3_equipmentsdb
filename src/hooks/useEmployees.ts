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
      queryClient.invalidateQueries({ queryKey: ['employees'], refetchType: 'inactive' }),
      queryClient.invalidateQueries({ queryKey: ['equipments'], refetchType: 'inactive' }),
    ]);
  };

  return {
    createEmployee: useMutation({
      mutationFn: (employee: EmployeePayload) => api.createEmployee(employee),
      onSuccess: async (created) => {
        queryClient.setQueryData<Employee[]>(['employees'], (current = []) => [created, ...current]);
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
      onSuccess: async (updated, variables) => {
        queryClient.setQueryData<Employee[]>(['employees'], (current = []) =>
          current.map((item) => (item.employeeId === (variables.previousEmployee?.employeeId ?? updated.employeeId) ? updated : item)),
        );
        if (variables.previousEmployee?.name && variables.previousEmployee.name !== updated.name) {
          queryClient.setQueriesData<{ issuedTo: string }[]>({ queryKey: ['equipments'] }, (current) =>
            current?.map((item) => (item.issuedTo === variables.previousEmployee?.name ? { ...item, issuedTo: updated.name } : item)),
          );
        }
        await refresh();
        pushToast({ title: 'Employee updated', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Employee was not updated', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
    deleteEmployee: useMutation({
      mutationFn: (employee: Employee) => api.deleteEmployee(employee),
      onSuccess: async (_employeeId, deleted) => {
        queryClient.setQueryData<Employee[]>(['employees'], (current = []) => current.filter((item) => item.employeeId !== deleted.employeeId));
        queryClient.setQueriesData<{ issuedTo: string }[]>({ queryKey: ['equipments'] }, (current) =>
          current?.map((item) => (item.issuedTo === deleted.name ? { ...item, issuedTo: '' } : item)),
        );
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
