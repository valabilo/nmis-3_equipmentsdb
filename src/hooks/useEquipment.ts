import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/appStore';
import type { EquipmentPayload } from '../types';

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
    await queryClient.invalidateQueries({ queryKey: ['equipments'] });
  };

  return {
    createEquipment: useMutation({
      mutationFn: (equipment: EquipmentPayload) => api.createEquipment(equipment),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Equipment added', tone: 'success' });
      },
    }),
    updateEquipment: useMutation({
      mutationFn: (equipment: EquipmentPayload & { id: string }) => api.updateEquipment(equipment),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Equipment updated', tone: 'success' });
      },
    }),
    deleteEquipment: useMutation({
      mutationFn: (id: string) => api.deleteEquipment(id),
      onSuccess: async () => {
        await refresh();
        pushToast({ title: 'Equipment deleted', tone: 'success' });
      },
    }),
  };
}
