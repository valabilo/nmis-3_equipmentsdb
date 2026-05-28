import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/appStore';
import type { Equipment, EquipmentPayload } from '../types';

export function useEquipments() {
  return useQuery({
    queryKey: ['equipments'],
    queryFn: api.getEquipments,
  });
}

export function useEquipmentByEmployee(employeeName: string) {
  return useQuery({
    queryKey: ['equipments', employeeName],
    queryFn: () => api.getEquipmentByEmployee(employeeName),
    enabled: Boolean(employeeName),
  });
}

export function useEquipmentMutations() {
  const queryClient = useQueryClient();
  const pushToast = useAppStore((state) => state.pushToast);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['equipments'], refetchType: 'inactive' });
  };

  return {
    createEquipment: useMutation({
      mutationFn: (equipment: EquipmentPayload) => api.createEquipment(equipment),
      onSuccess: async (created) => {
        queryClient.setQueryData<Equipment[]>(['equipments'], (current = []) => [created, ...current]);
        await refresh();
        pushToast({ title: 'Equipment added', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Equipment was not added', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
    updateEquipment: useMutation({
      mutationFn: (equipment: EquipmentPayload & { id: string }) => api.updateEquipment(equipment),
      onSuccess: async (updated) => {
        queryClient.setQueryData<Equipment[]>(['equipments'], (current = []) =>
          current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
        );
        queryClient.setQueriesData<Equipment[]>({ queryKey: ['equipments'] }, (current) =>
          current?.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
        );
        await refresh();
        pushToast({ title: 'Equipment updated', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Equipment was not updated', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
    deleteEquipment: useMutation({
      mutationFn: (id: string) => api.deleteEquipment(id),
      onSuccess: async (id) => {
        queryClient.setQueryData<Equipment[]>(['equipments'], (current = []) => current.filter((item) => item.id !== id));
        queryClient.setQueriesData<Equipment[]>({ queryKey: ['equipments'] }, (current) => current?.filter((item) => item.id !== id));
        await refresh();
        pushToast({ title: 'Equipment deleted', tone: 'success' });
      },
      onError: (error) => {
        pushToast({ title: 'Equipment was not deleted', description: getErrorMessage(error), tone: 'danger' });
      },
    }),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.';
}
