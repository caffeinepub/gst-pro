import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface SignUpRequest {
    password: string;
    mobileNumber: string;
    email: string;
    accessExpiry?: Time;
}
export interface StatusEntry {
    status: string;
    periodLabel: string;
    filingDate?: string;
    returnType: ReturnType_;
}
export interface LineItem {
    itemId: bigint;
    discount?: number;
    quantity: number;
    unitPrice: number;
}
export interface InvoiceKPIs {
    draftInvoices: bigint;
    finalizedInvoices: bigint;
    totalInvoices: bigint;
}
export interface CredentialResponse {
    role?: SystemRole;
    message: string;
    success: boolean;
}
export interface UserRecord {
    id: string;
    permissions: Permissions;
    principal?: Principal;
    deleted: boolean;
    createdAt: bigint;
    role: SystemRole;
    mobileNumber: string;
    email: string;
    lastSignIn?: Time;
    updatedAt: bigint;
    accessExpiry?: Time;
    passwordHash: string;
    lastUsed?: Time;
}
export interface GSTError {
    code: bigint;
    message: string;
}
export interface Permissions {
    canUseGstValidation: boolean;
    canVerifyBank: boolean;
    canManageUsers: boolean;
    canViewReports: boolean;
    canFileReturns: boolean;
    canExportData: boolean;
    canVerifyPan: boolean;
}
export interface CreateUserRequest {
    password: string;
    role: SystemRole;
    mobileNumber: string;
    email: string;
    accessExpiry?: Time;
}
export interface BankingDetails {
    branch?: string;
    ifscCode: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UpdateUserRequest {
    permissions: Permissions;
    role: SystemRole;
    mobileNumber: string;
    email: string;
    accessExpiry?: Time;
}
export interface SignUpResponse {
    id: string;
    permissions: Permissions;
    createdAt: bigint;
    role: SystemRole;
    mobileNumber: string;
    email: string;
    updatedAt: bigint;
    accessExpiry?: Time;
    lastUsed?: Time;
}
export interface GSTFilingStatus {
    natureOfBusiness?: string;
    tradeName?: string;
    period: string;
    cancellationDate?: string;
    principalPlaceOfBusiness?: string;
    isActive?: boolean;
    filingFrequencyDetails?: string;
    error?: GSTError;
    legalName?: string;
    statusEntries: Array<StatusEntry>;
    state?: string;
    gstin: string;
    taxpayerType?: string;
    address?: string;
    gstStatus?: string;
    filingFrequency: FilingFrequency;
    registrationDate?: string;
    returnType: ReturnType_;
}
export interface Invoice {
    id: bigint;
    status: InvoiceStatus;
    lineItems: Array<LineItem>;
    purchaseOrderNumber?: string;
    invoiceDate: string;
    invoiceNumber: string;
    invoiceType: InvoiceType;
    customerId: bigint;
}
export interface Customer {
    id: bigint;
    contactInfo?: string;
    billingAddress: string;
    name: string;
    state: string;
    gstin?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Item {
    id: bigint;
    hsnSac?: string;
    name: string;
    description?: string;
    unitPrice: number;
    defaultGstRate: number;
}
export interface BusinessProfile {
    bankingDetails?: BankingDetails;
    startingNumber: bigint;
    logo?: ExternalBlob;
    businessName: string;
    state: string;
    invoicePrefix: string;
    gstin: string;
    address: string;
}
export interface UnifiedUserInfo {
    userType: Variant_credential_principalOnly;
    deleted?: boolean;
    role?: SystemRole;
    email?: string;
    lastSignIn?: Time;
    accessExpiry?: Time;
    identifier: string;
    lastUsed?: Time;
}
export enum FilingFrequency {
    quarterly = "quarterly",
    monthly = "monthly"
}
export enum InvoiceStatus {
    cancelled = "cancelled",
    finalized = "finalized",
    draft = "draft"
}
export enum InvoiceType {
    transportation = "transportation",
    original = "original"
}
export enum ReturnType_ {
    gstr1 = "gstr1",
    gstr3b = "gstr3b"
}
export enum SystemRole {
    auditor = "auditor",
    superAdmin = "superAdmin",
    standard = "standard"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_credential_principalOnly {
    credential = "credential",
    principalOnly = "principalOnly"
}
export interface backendInterface {
    addCustomer(name: string, billingAddress: string, gstin: string | null, state: string, contactInfo: string | null): Promise<Customer>;
    addItem(name: string, description: string | null, hsnSac: string | null, unitPrice: number, defaultGstRate: number): Promise<Item>;
    adminGetUserInvoiceKPIs(userId: string): Promise<InvoiceKPIs>;
    adminGetUserInvoices(userId: string): Promise<Array<Invoice>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateApplicationCredentials(userId: string, password: string): Promise<CredentialResponse>;
    cancelInvoice(id: bigint): Promise<void>;
    createInvoice(invoiceNumber: string, purchaseOrderNumber: string | null, customerId: bigint, lineItems: Array<LineItem>, invoiceDate: string, invoiceType: InvoiceType): Promise<Invoice>;
    createUser(request: CreateUserRequest): Promise<SignUpResponse>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteInvoice(id: bigint): Promise<void>;
    deleteItem(id: bigint): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    editCustomer(id: bigint, name: string, billingAddress: string, gstin: string | null, state: string, contactInfo: string | null): Promise<void>;
    editInvoice(id: bigint, invoiceNumber: string, purchaseOrderNumber: string | null, customerId: bigint, lineItems: Array<LineItem>, status: InvoiceStatus, invoiceDate: string, invoiceType: InvoiceType): Promise<void>;
    editItem(id: bigint, name: string, description: string | null, hsnSac: string | null, unitPrice: number, defaultGstRate: number): Promise<void>;
    fetchGstFilingStatus(gstin: string, period: string, returnType: ReturnType_, filingFrequency: FilingFrequency): Promise<GSTFilingStatus>;
    finalizeInvoice(id: bigint): Promise<void>;
    getAccessExpiry(userId: string): Promise<Time | null>;
    getBusinessProfile(): Promise<BusinessProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getCustomers(): Promise<Array<Customer>>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getInvoices(): Promise<Array<Invoice>>;
    getItem(id: bigint): Promise<Item | null>;
    getItems(): Promise<Array<Item>>;
    getLastSignIn(userId: string): Promise<Time | null>;
    getLastUsed(userId: string): Promise<Time | null>;
    getPotentialSystemRoles(): Promise<Array<SystemRole>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserProfile(): Promise<boolean>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<UnifiedUserInfo>>;
    listUsers(): Promise<Array<UserRecord>>;
    recordInternetIdentitySignIn(): Promise<void>;
    saveBusinessProfile(profile: BusinessProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAccessExpiry(userId: string, expiryTimestamp: Time | null): Promise<void>;
    signUp(request: SignUpRequest): Promise<SignUpResponse>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateUser(userId: string, request: UpdateUserRequest): Promise<void>;
}
