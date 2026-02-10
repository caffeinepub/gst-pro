import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  BusinessProfile,
  Customer,
  Item,
  Invoice,
  LineItem,
  InvoiceStatus,
  InvoiceType,
  GSTFilingStatus,
  ReturnType_,
  FilingFrequency,
  CreateUserRequest,
  SignUpResponse,
  UpdateUserRequest,
  UserRecord,
  Time,
  InvoiceKPIs,
  UnifiedUserInfo,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Business Profile Queries
export function useGetBusinessProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BusinessProfile | null>({
    queryKey: ['businessProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBusinessProfile();
    },
    enabled: !!actor && !actorFetching,
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

// Customer Queries
export function useGetCustomers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCustomer(customerId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Customer | null>({
    queryKey: ['customer', customerId?.toString()],
    queryFn: async () => {
      if (!actor || !customerId) return null;
      return actor.getCustomer(customerId);
    },
    enabled: !!actor && !actorFetching && customerId !== null,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      billingAddress: string;
      gstin: string | null;
      state: string;
      contactInfo: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(
        params.name,
        params.billingAddress,
        params.gstin,
        params.state,
        params.contactInfo
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
    mutationFn: async (params: {
      id: bigint;
      name: string;
      billingAddress: string;
      gstin: string | null;
      state: string;
      contactInfo: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCustomer(
        params.id,
        params.name,
        params.billingAddress,
        params.gstin,
        params.state,
        params.contactInfo
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

// Item Queries
export function useGetItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetItem(itemId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['item', itemId?.toString()],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getItem(itemId);
    },
    enabled: !!actor && !actorFetching && itemId !== null,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string | null;
      hsnSac: string | null;
      unitPrice: number;
      defaultGstRate: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addItem(
        params.name,
        params.description,
        params.hsnSac,
        params.unitPrice,
        params.defaultGstRate
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
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string | null;
      hsnSac: string | null;
      unitPrice: number;
      defaultGstRate: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editItem(
        params.id,
        params.name,
        params.description,
        params.hsnSac,
        params.unitPrice,
        params.defaultGstRate
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

// Invoice Queries
export function useGetInvoices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInvoices();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetInvoice(invoiceId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Invoice | null>({
    queryKey: ['invoice', invoiceId?.toString()],
    queryFn: async () => {
      if (!actor || !invoiceId) return null;
      return actor.getInvoice(invoiceId);
    },
    enabled: !!actor && !actorFetching && invoiceId !== null,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      invoiceNumber: string;
      purchaseOrderNumber: string | null;
      customerId: bigint;
      lineItems: LineItem[];
      invoiceDate: string;
      invoiceType: InvoiceType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvoice(
        params.invoiceNumber,
        params.purchaseOrderNumber,
        params.customerId,
        params.lineItems,
        params.invoiceDate,
        params.invoiceType
      );
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
    mutationFn: async (params: {
      id: bigint;
      invoiceNumber: string;
      purchaseOrderNumber: string | null;
      customerId: bigint;
      lineItems: LineItem[];
      status: InvoiceStatus;
      invoiceDate: string;
      invoiceType: InvoiceType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editInvoice(
        params.id,
        params.invoiceNumber,
        params.purchaseOrderNumber,
        params.customerId,
        params.lineItems,
        params.status,
        params.invoiceDate,
        params.invoiceType
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id.toString()] });
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

export function useCancelInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelInvoice(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id.toString()] });
    },
  });
}

// GST Filing Status Query
export function useGetGstFilingStatus(
  gstin: string,
  period: string,
  returnType: ReturnType_,
  filingFrequency: FilingFrequency
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GSTFilingStatus>({
    queryKey: ['gstFilingStatus', gstin, period, returnType, filingFrequency],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchGstFilingStatus(gstin, period, returnType, filingFrequency);
    },
    enabled: !!actor && !actorFetching && !!gstin && !!period,
    retry: false,
  });
}

// Admin User Management Queries
export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; request: UpdateUserRequest }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUser(params.userId, params.request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRecord[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useListAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UnifiedUserInfo[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetAccessExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; expiryTimestamp: Time | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAccessExpiry(params.userId, params.expiryTimestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useAdminGetUserInvoices(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['adminUserInvoices', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGetUserInvoices(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useAdminGetUserInvoiceKPIs(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<InvoiceKPIs>({
    queryKey: ['adminUserInvoiceKPIs', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGetUserInvoiceKPIs(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}
