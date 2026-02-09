import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    id: bigint;
    hsnSac?: string;
    name: string;
    description?: string;
    unitPrice: number;
    defaultGstRate: number;
}
export interface LineItem {
    itemId: bigint;
    discount?: number;
    quantity: number;
    unitPrice: number;
}
export interface Invoice {
    id: bigint;
    status: InvoiceStatus;
    lineItems: Array<LineItem>;
    customerId: bigint;
}
export interface BusinessProfile {
    startingNumber: bigint;
    businessName: string;
    state: string;
    invoicePrefix: string;
    gstin: string;
    address: string;
}
export interface Customer {
    id: bigint;
    contactInfo?: string;
    billingAddress: string;
    name: string;
    state: string;
    gstin?: string;
}
export interface UserProfile {
    name: string;
}
export enum InvoiceStatus {
    finalized = "finalized",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, billingAddress: string, gstin: string | null, state: string, contactInfo: string | null): Promise<Customer>;
    addItem(name: string, description: string | null, hsnSac: string | null, unitPrice: number, defaultGstRate: number): Promise<Item>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInvoice(customerId: bigint, lineItems: Array<LineItem>): Promise<Invoice>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteInvoice(id: bigint): Promise<void>;
    deleteItem(id: bigint): Promise<void>;
    editCustomer(id: bigint, name: string, billingAddress: string, gstin: string | null, state: string, contactInfo: string | null): Promise<void>;
    editInvoice(id: bigint, customerId: bigint, lineItems: Array<LineItem>, status: InvoiceStatus): Promise<void>;
    editItem(id: bigint, name: string, description: string | null, hsnSac: string | null, unitPrice: number, defaultGstRate: number): Promise<void>;
    finalizeInvoice(id: bigint): Promise<void>;
    getBusinessProfile(): Promise<BusinessProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getCustomers(): Promise<Array<Customer>>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getInvoices(): Promise<Array<Invoice>>;
    getItem(id: bigint): Promise<Item | null>;
    getItems(): Promise<Array<Item>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveBusinessProfile(profile: BusinessProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
