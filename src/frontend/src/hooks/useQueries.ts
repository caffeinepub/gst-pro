import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BusinessProfile, Customer, Item, Invoice, LineItem, InvoiceStatus } from '../backend';

// Business Profile
export function useGetBusinessProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<BusinessProfile | null>({
    queryKey: ['businessProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBusinessProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBusinessProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveBusinessProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}

// Customers
export function useGetCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomer(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Customer | null>({
    queryKey: ['customer', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      billingAddress: string;
      gstin: string | null;
      state: string;
      contactInfo: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(
        data.name,
        data.billingAddress,
        data.gstin,
        data.state,
        data.contactInfo
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useEditCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      billingAddress: string;
      gstin: string | null;
      state: string;
      contactInfo: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCustomer(
        data.id,
        data.name,
        data.billingAddress,
        data.gstin,
        data.state,
        data.contactInfo
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id.toString()] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Items
export function useGetItems() {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItem(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['item', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getItem(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string | null;
      hsnSac: string | null;
      unitPrice: number;
      defaultGstRate: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addItem(
        data.name,
        data.description,
        data.hsnSac,
        data.unitPrice,
        data.defaultGstRate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useEditItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string | null;
      hsnSac: string | null;
      unitPrice: number;
      defaultGstRate: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editItem(
        data.id,
        data.name,
        data.description,
        data.hsnSac,
        data.unitPrice,
        data.defaultGstRate
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id.toString()] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

// Invoices
export function useGetInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInvoice(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice | null>({
    queryKey: ['invoice', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { customerId: bigint; lineItems: LineItem[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvoice(data.customerId, data.lineItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useEditInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      customerId: bigint;
      lineItems: LineItem[];
      status: InvoiceStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editInvoice(data.id, data.customerId, data.lineItems, data.status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id.toString()] });
    },
  });
}

export function useFinalizeInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.finalizeInvoice(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id.toString()] });
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInvoice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
