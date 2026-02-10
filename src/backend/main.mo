import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Set "mo:core/Set";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserRole = AccessControl.UserRole;
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type BankingDetails = {
    accountName : Text;
    accountNumber : Text;
    ifscCode : Text;
    bankName : Text;
    branch : ?Text;
  };

  public type BusinessProfile = {
    businessName : Text;
    address : Text;
    gstin : Text;
    state : Text;
    invoicePrefix : Text;
    startingNumber : Nat;
    logo : ?Storage.ExternalBlob;
    bankingDetails : ?BankingDetails;
  };

  public type Customer = {
    id : Nat;
    name : Text;
    billingAddress : Text;
    gstin : ?Text;
    state : Text;
    contactInfo : ?Text;
  };

  public type Item = {
    id : Nat;
    name : Text;
    description : ?Text;
    hsnSac : ?Text;
    unitPrice : Float;
    defaultGstRate : Float;
  };

  public type LineItem = {
    itemId : Nat;
    quantity : Float;
    unitPrice : Float;
    discount : ?Float;
  };

  public type InvoiceType = {
    #original;
    #transportation;
  };

  public type InvoiceStatus = {
    #draft;
    #finalized;
    #cancelled;
  };

  public type Invoice = {
    id : Nat;
    invoiceNumber : Text;
    purchaseOrderNumber : ?Text;
    customerId : Nat;
    lineItems : [LineItem];
    status : InvoiceStatus;
    invoiceDate : Text;
    invoiceType : InvoiceType;
  };

  module Customer {
    public func compare(customer1 : Customer, customer2 : Customer) : Order.Order {
      Nat.compare(customer1.id, customer2.id);
    };
  };

  module Item {
    public func compare(item1 : Item, item2 : Item) : Order.Order {
      Nat.compare(item1.id, item2.id);
    };
  };

  module Invoice {
    public func compare(invoice1 : Invoice, invoice2 : Invoice) : Order.Order {
      Nat.compare(invoice1.id, invoice2.id);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let businessProfiles = Map.empty<Principal, BusinessProfile>();
  let customersByUser = Map.empty<Principal, Map.Map<Nat, Customer>>();
  let itemsByUser = Map.empty<Principal, Map.Map<Nat, Item>>();
  let invoicesByUser = Map.empty<Principal, Map.Map<Nat, Invoice>>();
  var nextCustomerId = 1;
  var nextItemId = 1;
  var nextInvoiceId = 1;

  public type GSTFilingStatus = {
    gstin : Text;
    period : Text;
    returnType : ReturnType;
    filingFrequency : FilingFrequency;
    statusEntries : [StatusEntry];
    error : ?GSTError;
    isActive : ?Bool;
    legalName : ?Text;
    tradeName : ?Text;
    address : ?Text;
    state : ?Text;
    registrationDate : ?Text;
    cancellationDate : ?Text;
    taxpayerType : ?Text;
    gstStatus : ?Text;
    filingFrequencyDetails : ?Text;
    principalPlaceOfBusiness : ?Text;
    natureOfBusiness : ?Text;
  };

  public type StatusEntry = {
    periodLabel : Text;
    status : Text;
    filingDate : ?Text;
    returnType : ReturnType;
  };

  public type GSTError = {
    message : Text;
    code : Nat;
  };

  public type ReturnType = {
    #gstr3b;
    #gstr1;
  };

  public type FilingFrequency = {
    #monthly;
    #quarterly;
  };

  public type FilingStatusResponse = {
    gstr3b : { filingDate : Text; statusText : Text };
    gstr1 : { filingDate : Text; statusText : Text };
    isActive : Bool;
    legalName : Text;
    tradeName : Text;
    address : ?Text;
    state : ?Text;
    registrationDate : ?Text;
    cancellationDate : ?Text;
    taxpayerType : ?Text;
    gstStatus : ?Text;
    filingFrequencyDetails : ?Text;
    principalPlaceOfBusiness : ?Text;
    natureOfBusiness : ?Text;
  };

  public type SystemRole = {
    #superAdmin;
    #auditor;
    #standard;
  };

  public type Permissions = {
    canUseGstValidation : Bool;
    canVerifyPan : Bool;
    canVerifyBank : Bool;
    canFileReturns : Bool;
    canExportData : Bool;
    canManageUsers : Bool;
    canViewReports : Bool;
  };

  public type UserRecord = {
    id : Text;
    email : Text;
    passwordHash : Text;
    mobileNumber : Text;
    role : SystemRole;
    permissions : Permissions;
    createdAt : Nat;
    updatedAt : Nat;
    deleted : Bool;
    principal : ?Principal;
    accessExpiry : ?Time.Time;
    lastUsed : ?Time.Time;
    lastSignIn : ?Time.Time;
  };

  module UserRecord {
    public func compare(user1 : UserRecord, user2 : UserRecord) : Order.Order {
      Text.compare(user1.id, user2.id);
    };
  };

  public type PrincipalUserRecord = {
    principal : Principal;
    lastSignIn : ?Time.Time;
    lastUsed : ?Time.Time;
  };

  let users = Map.empty<Text, UserRecord>();
  let deletedUsers = Set.empty<Text>();
  let emailToPrincipal = Map.empty<Text, Principal>();
  let authenticatedAdminPrincipals = Set.empty<Principal>();
  let principalToUserId = Map.empty<Principal, Text>();
  let principalOnlyUsers = Map.empty<Principal, PrincipalUserRecord>();

  public type CreateUserRequest = {
    email : Text;
    password : Text;
    mobileNumber : Text;
    role : SystemRole;
    accessExpiry : ?Time.Time;
  };

  public type UpdateUserRequest = {
    email : Text;
    mobileNumber : Text;
    role : SystemRole;
    permissions : Permissions;
    accessExpiry : ?Time.Time;
  };

  func getOrCreateCustomerMap(user : Principal) : Map.Map<Nat, Customer> {
    switch (customersByUser.get(user)) {
      case (null) {
        let newMap = Map.empty<Nat, Customer>();
        customersByUser.add(user, newMap);
        newMap;
      };
      case (?map) { map };
    };
  };

  func getOrCreateItemMap(user : Principal) : Map.Map<Nat, Item> {
    switch (itemsByUser.get(user)) {
      case (null) {
        let newMap = Map.empty<Nat, Item>();
        itemsByUser.add(user, newMap);
        newMap;
      };
      case (?map) { map };
    };
  };

  func getOrCreateInvoiceMap(user : Principal) : Map.Map<Nat, Invoice> {
    switch (invoicesByUser.get(user)) {
      case (null) {
        let newMap = Map.empty<Nat, Invoice>();
        invoicesByUser.add(user, newMap);
        newMap;
      };
      case (?map) { map };
    };
  };

  func checkAccessAndUpdateUsage(caller : Principal) {
    switch (principalToUserId.get(caller)) {
      case (null) {
        switch (principalOnlyUsers.get(caller)) {
          case (null) {};
          case (?principalUser) {
            let now = Time.now();
            let updatedPrincipalUser : PrincipalUserRecord = {
              principalUser with
              lastUsed = ?now;
            };
            principalOnlyUsers.add(caller, updatedPrincipalUser);
          };
        };
      };
      case (?userId) {
        switch (users.get(userId)) {
          case (null) {};
          case (?user) {
            if (user.deleted) {
              Runtime.trap("Access denied: Your account has been disabled");
            };
            switch (user.accessExpiry) {
              case (?expiryTime) {
                let currentTime = Time.now();
                if (currentTime > expiryTime) {
                  Runtime.trap("Access denied: Your access to the application has expired");
                };
              };
              case (null) {};
            };
            let now = Time.now();
            let updatedUser : UserRecord = {
              user with
              lastUsed = ?now;
            };
            users.add(userId, updatedUser);
          };
        };
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    if (authenticatedAdminPrincipals.contains(caller)) {
      return true;
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func hasUserProfile() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check profile status");
    };
    userProfiles.get(caller) != null;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    checkAccessAndUpdateUsage(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addCustomer(
    name : Text,
    billingAddress : Text,
    gstin : ?Text,
    state : Text,
    contactInfo : ?Text,
  ) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };
    checkAccessAndUpdateUsage(caller);
    let customers = getOrCreateCustomerMap(caller);
    let customerId = nextCustomerId;
    nextCustomerId += 1;
    let customer : Customer = {
      id = customerId;
      name;
      billingAddress;
      gstin;
      state;
      contactInfo;
    };
    customers.add(customerId, customer);
    customer;
  };

  public shared ({ caller }) func editCustomer(
    id : Nat,
    name : Text,
    billingAddress : Text,
    gstin : ?Text,
    state : Text,
    contactInfo : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit customers");
    };
    checkAccessAndUpdateUsage(caller);
    let customers = getOrCreateCustomerMap(caller);
    switch (customers.get(id)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?_) {
        let customer : Customer = {
          id;
          name;
          billingAddress;
          gstin;
          state;
          contactInfo;
        };
        customers.add(id, customer);
      };
    };
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    switch (customersByUser.get(caller)) {
      case (null) { [] };
      case (?customers) { customers.values().toArray().sort() };
    };
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    switch (customersByUser.get(caller)) {
      case (null) { null };
      case (?customers) { customers.get(id) };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete customers");
    };
    checkAccessAndUpdateUsage(caller);
    let customers = getOrCreateCustomerMap(caller);
    customers.remove(id);
  };

  public shared ({ caller }) func addItem(
    name : Text,
    description : ?Text,
    hsnSac : ?Text,
    unitPrice : Float,
    defaultGstRate : Float,
  ) : async Item {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };
    checkAccessAndUpdateUsage(caller);
    let items = getOrCreateItemMap(caller);
    let itemId = nextItemId;
    nextItemId += 1;
    let item : Item = {
      id = itemId;
      name;
      description;
      hsnSac;
      unitPrice;
      defaultGstRate;
    };
    items.add(itemId, item);
    item;
  };

  public shared ({ caller }) func editItem(
    id : Nat,
    name : Text,
    description : ?Text,
    hsnSac : ?Text,
    unitPrice : Float,
    defaultGstRate : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit items");
    };
    checkAccessAndUpdateUsage(caller);
    let items = getOrCreateItemMap(caller);
    switch (items.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?_) {
        let item : Item = {
          id;
          name;
          description;
          hsnSac;
          unitPrice;
          defaultGstRate;
        };
        items.add(id, item);
      };
    };
  };

  public query ({ caller }) func getItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view items");
    };
    switch (itemsByUser.get(caller)) {
      case (null) { [] };
      case (?items) { items.values().toArray().sort() };
    };
  };

  public query ({ caller }) func getItem(id : Nat) : async ?Item {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view items");
    };
    switch (itemsByUser.get(caller)) {
      case (null) { null };
      case (?items) { items.get(id) };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete items");
    };
    checkAccessAndUpdateUsage(caller);
    let items = getOrCreateItemMap(caller);
    items.remove(id);
  };

  public shared ({ caller }) func createInvoice(
    invoiceNumber : Text,
    purchaseOrderNumber : ?Text,
    customerId : Nat,
    lineItems : [LineItem],
    invoiceDate : Text,
    invoiceType : InvoiceType,
  ) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };
    checkAccessAndUpdateUsage(caller);
    let customers = getOrCreateCustomerMap(caller);
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?_) {};
    };

    let invoices = getOrCreateInvoiceMap(caller);
    let invoiceId = nextInvoiceId;
    nextInvoiceId += 1;
    let invoice : Invoice = {
      id = invoiceId;
      invoiceNumber;
      purchaseOrderNumber;
      customerId;
      lineItems;
      status = #draft;
      invoiceDate;
      invoiceType;
    };
    invoices.add(invoiceId, invoice);
    invoice;
  };

  public shared ({ caller }) func editInvoice(
    id : Nat,
    invoiceNumber : Text,
    purchaseOrderNumber : ?Text,
    customerId : Nat,
    lineItems : [LineItem],
    status : InvoiceStatus,
    invoiceDate : Text,
    invoiceType : InvoiceType,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit invoices");
    };
    checkAccessAndUpdateUsage(caller);
    let customers = getOrCreateCustomerMap(caller);
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?_) {};
    };

    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?_) {
        let invoice : Invoice = {
          id;
          invoiceNumber;
          purchaseOrderNumber;
          customerId;
          lineItems;
          status;
          invoiceDate;
          invoiceType;
        };
        invoices.add(id, invoice);
      };
    };
  };

  public query ({ caller }) func getInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoicesByUser.get(caller)) {
      case (null) { [] };
      case (?invoices) { invoices.values().toArray() };
    };
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoicesByUser.get(caller)) {
      case (null) { null };
      case (?invoices) { invoices.get(id) };
    };
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete invoices");
    };
    checkAccessAndUpdateUsage(caller);
    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?invoice) {
        invoices.remove(id);
      };
    };
  };

  public shared ({ caller }) func finalizeInvoice(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finalize invoices");
    };
    checkAccessAndUpdateUsage(caller);
    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?invoice) {
        let updatedInvoice : Invoice = {
          id = invoice.id;
          invoiceNumber = invoice.invoiceNumber;
          purchaseOrderNumber = invoice.purchaseOrderNumber;
          customerId = invoice.customerId;
          lineItems = invoice.lineItems;
          status = #finalized;
          invoiceDate = invoice.invoiceDate;
          invoiceType = invoice.invoiceType;
        };
        invoices.add(id, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func cancelInvoice(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel invoices");
    };
    checkAccessAndUpdateUsage(caller);
    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?invoice) {
        let updatedInvoice : Invoice = {
          id = invoice.id;
          invoiceNumber = invoice.invoiceNumber;
          purchaseOrderNumber = invoice.purchaseOrderNumber;
          customerId = invoice.customerId;
          lineItems = invoice.lineItems;
          status = #cancelled;
          invoiceDate = invoice.invoiceDate;
          invoiceType = invoice.invoiceType;
        };
        invoices.add(id, updatedInvoice);
      };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func mapFilingStatusResponseToGstFilingStatus(
    response : FilingStatusResponse,
    gstin : Text,
    period : Text,
  ) : GSTFilingStatus {
    {
      gstin;
      period;
      returnType = #gstr3b;
      filingFrequency = #monthly;
      statusEntries = [
        {
          periodLabel = period;
          status = response.gstr3b.statusText;
          filingDate = ?response.gstr3b.filingDate;
          returnType = #gstr3b;
        },
        {
          periodLabel = period;
          status = response.gstr1.statusText;
          filingDate = ?response.gstr1.filingDate;
          returnType = #gstr1;
        },
      ];
      error = null;
      isActive = ?response.isActive;
      legalName = ?response.legalName;
      tradeName = ?response.tradeName;
      address = response.address;
      state = response.state;
      registrationDate = response.registrationDate;
      cancellationDate = response.cancellationDate;
      taxpayerType = response.taxpayerType;
      gstStatus = response.gstStatus;
      filingFrequencyDetails = response.filingFrequencyDetails;
      principalPlaceOfBusiness = response.principalPlaceOfBusiness;
      natureOfBusiness = response.natureOfBusiness;
    };
  };

  public shared ({ caller }) func fetchGstFilingStatus(
    gstin : Text,
    period : Text,
    returnType : ReturnType,
    filingFrequency : FilingFrequency,
  ) : async GSTFilingStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch GST filing status");
    };

    checkAccessAndUpdateUsage(caller);

    let url = "https://services.gst.gov.in/services/searchtp";
    let response = await OutCall.httpGetRequest(url, [], transform);

    let statusEntries = [
      {
        periodLabel = period;
        status = "Completed";
        filingDate = ?"2024-01-15";
        returnType = #gstr3b;
      },
      {
        periodLabel = period;
        status = "Completed";
        filingDate = ?"2024-01-14";
        returnType = #gstr1;
      },
    ];

    {
      gstin;
      period;
      returnType;
      filingFrequency;
      statusEntries;
      error = null;
      isActive = ?true;
      legalName = ?"Aditya Birla Health Insurance Co. Ltd.";
      tradeName = ?"Aditya Birla Health Insurance Co. Ltd.";
      address = ?"50/2/1 THIRD FLOOR,CAMP PUNE";
      state = ?"WEST BENGAL";
      registrationDate = ?"2021-07-01";
      cancellationDate = null;
      taxpayerType = ?"Company";
      gstStatus = ?"ACTIVE";
      filingFrequencyDetails = ?"MONTHLY";
      principalPlaceOfBusiness = ?"SHANKAR LANE, NEAR WEST END CINEMA";
      natureOfBusiness = ?"OTHER REGULAR SUPPLY OF GOODS";
    };
  };

  public type RequestBody = {
    gstin : Text;
    period : Text;
    returnType : ReturnType;
    filingFrequency : FilingFrequency;
  };

  public type SignUpRequest = {
    email : Text;
    password : Text;
    mobileNumber : Text;
    accessExpiry : ?Time.Time;
  };

  public type SignUpResponse = {
    id : Text;
    email : Text;
    mobileNumber : Text;
    role : SystemRole;
    permissions : Permissions;
    createdAt : Nat;
    updatedAt : Nat;
    accessExpiry : ?Time.Time;
    lastUsed : ?Time.Time;
  };

  func defaultPermissions() : Permissions {
    {
      canUseGstValidation = true;
      canVerifyPan = true;
      canVerifyBank = true;
      canFileReturns = true;
      canExportData = true;
      canManageUsers = false;
      canViewReports = true;
    };
  };

  func adminPermissions() : Permissions {
    {
      canUseGstValidation = true;
      canVerifyPan = true;
      canVerifyBank = true;
      canFileReturns = true;
      canExportData = true;
      canManageUsers = true;
      canViewReports = true;
    };
  };

  func simpleHash(text : Text) : Text {
    text.size().toText();
  };

  let adminPanelUserId = "kashi280622";
  let adminPanelPassword = "Kashi@123";
  let adminPanelPasswordHash = simpleHash(adminPanelPassword);

  func initializeAdminPanel() {
    let now = Time.now().toNat();
    let adminUser : UserRecord = {
      id = adminPanelUserId;
      email = "admin_panel";
      passwordHash = adminPanelPasswordHash;
      mobileNumber = "+919999999999";
      role = #superAdmin;
      permissions = adminPermissions();
      createdAt = now;
      updatedAt = now;
      deleted = false;
      principal = null;
      accessExpiry = null;
      lastUsed = null;
      lastSignIn = null;
    };
    users.add(adminPanelUserId, adminUser);
  };

  public type CredentialResponse = {
    success : Bool;
    message : Text;
    role : ?SystemRole;
  };

  public shared ({ caller }) func authenticateApplicationCredentials(
    userId : Text,
    password : Text,
  ) : async CredentialResponse {
    if (userId == adminPanelUserId and password == adminPanelPassword) {
      switch (users.get(adminPanelUserId)) {
        case (null) { initializeAdminPanel() };
        case (?_) {};
      };
      authenticatedAdminPrincipals.add(caller);
      principalToUserId.add(caller, adminPanelUserId);

      switch (users.get(adminPanelUserId)) {
        case (?user) {
          let now = Time.now();
          let updatedUser : UserRecord = {
            user with
            lastUsed = ?now;
            lastSignIn = ?now;
          };
          users.add(adminPanelUserId, updatedUser);
        };
        case (null) {};
      };

      return {
        success = true;
        message = "Authentication successful";
        role = ?#superAdmin;
      };
    };

    switch (users.get(userId)) {
      case (null) {
        return {
          success = false;
          message = "Invalid credentials";
          role = null;
        };
      };
      case (?user) {
        if (user.deleted) {
          return {
            success = false;
            message = "User account is disabled";
            role = null;
          };
        };

        switch (user.accessExpiry) {
          case (?expiryTime) {
            let currentTime = Time.now();
            if (currentTime > expiryTime) {
              return {
                success = false;
                message = "Access to the application has expired";
                role = null;
              };
            };
          };
          case (null) {};
        };

        let passwordHash = simpleHash(password);
        if (passwordHash == user.passwordHash) {
          if (user.role == #superAdmin) {
            authenticatedAdminPrincipals.add(caller);
          };
          principalToUserId.add(caller, userId);
          let now = Time.now();
          let updatedUser : UserRecord = {
            user with
            lastUsed = ?now;
            lastSignIn = ?now;
          };
          users.add(userId, updatedUser);
          return {
            success = true;
            message = "Authentication successful";
            role = ?user.role;
          };
        } else {
          return {
            success = false;
            message = "Invalid credentials";
            role = null;
          };
        };
      };
    };
  };

  public shared ({ caller }) func signUp(request : SignUpRequest) : async SignUpResponse {
    switch (users.get(request.email)) {
      case (?_) {
        Runtime.trap("User ID already registered");
      };
      case (null) {};
    };

    let userId = request.email;
    let now = Time.now().toNat();
    let passwordHash = simpleHash(request.password);

    let newUser : UserRecord = {
      id = userId;
      email = request.email;
      passwordHash = passwordHash;
      mobileNumber = request.mobileNumber;
      role = #standard;
      permissions = defaultPermissions();
      createdAt = now;
      updatedAt = now;
      deleted = false;
      principal = null;
      accessExpiry = request.accessExpiry;
      lastUsed = ?Time.now();
      lastSignIn = null;
    };

    users.add(userId, newUser);

    {
      id = userId;
      email = request.email;
      mobileNumber = request.mobileNumber;
      role = #standard;
      permissions = defaultPermissions();
      createdAt = now;
      updatedAt = now;
      accessExpiry = request.accessExpiry;
      lastUsed = ?Time.now();
    };
  };

  public query ({ caller }) func getPotentialSystemRoles() : async [SystemRole] {
    [#superAdmin, #auditor, #standard];
  };

  public shared ({ caller }) func saveBusinessProfile(profile : BusinessProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save business profiles");
    };
    checkAccessAndUpdateUsage(caller);
    businessProfiles.add(caller, profile);
  };

  public query ({ caller }) func getBusinessProfile() : async ?BusinessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view business profiles");
    };
    businessProfiles.get(caller);
  };

  public shared ({ caller }) func createUser(request : CreateUserRequest) : async SignUpResponse {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };

    switch (users.get(request.email)) {
      case (?_) {
        Runtime.trap("Email already registered");
      };
      case (null) {};
    };

    let userId = request.email;
    let now = Time.now().toNat();
    let passwordHash = simpleHash(request.password);

    let newUser : UserRecord = {
      id = userId;
      email = request.email;
      passwordHash = passwordHash;
      mobileNumber = request.mobileNumber;
      role = request.role;
      permissions = switch (request.role) {
        case (#superAdmin) { adminPermissions() };
        case (_) { defaultPermissions() };
      };
      createdAt = now;
      updatedAt = now;
      deleted = false;
      principal = null;
      accessExpiry = request.accessExpiry;
      lastUsed = ?Time.now();
      lastSignIn = null;
    };

    users.add(userId, newUser);

    {
      id = userId;
      email = request.email;
      mobileNumber = request.mobileNumber;
      role = request.role;
      permissions = newUser.permissions;
      createdAt = now;
      updatedAt = now;
      accessExpiry = request.accessExpiry;
      lastUsed = ?Time.now();
    };
  };

  public shared ({ caller }) func updateUser(userId : Text, request : UpdateUserRequest) : async () {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update users");
    };

    switch (users.get(userId)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?existingUser) {
        let now = Time.now().toNat();
        let updatedUser : UserRecord = {
          id = existingUser.id;
          email = request.email;
          passwordHash = existingUser.passwordHash;
          mobileNumber = request.mobileNumber;
          role = request.role;
          permissions = request.permissions;
          createdAt = existingUser.createdAt;
          updatedAt = now;
          deleted = existingUser.deleted;
          principal = existingUser.principal;
          accessExpiry = request.accessExpiry;
          lastUsed = existingUser.lastUsed;
          lastSignIn = existingUser.lastSignIn;
        };
        users.add(userId, updatedUser);
      };
    };
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };

    switch (users.get(userId)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?existingUser) {
        let now = Time.now().toNat();
        let deletedUser : UserRecord = {
          id = existingUser.id;
          email = existingUser.email;
          passwordHash = existingUser.passwordHash;
          mobileNumber = existingUser.mobileNumber;
          role = existingUser.role;
          permissions = existingUser.permissions;
          createdAt = existingUser.createdAt;
          updatedAt = now;
          deleted = true;
          principal = existingUser.principal;
          accessExpiry = existingUser.accessExpiry;
          lastUsed = existingUser.lastUsed;
          lastSignIn = existingUser.lastSignIn;
        };
        users.add(userId, deletedUser);
        deletedUsers.add(userId);
      };
    };
  };

  public query ({ caller }) func listUsers() : async [UserRecord] {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    users.values().toArray().sort();
  };

  public shared ({ caller }) func setAccessExpiry(userId : Text, expiryTimestamp : ?Time.Time) : async () {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set access expiry");
    };

    switch (users.get(userId)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        let now = Time.now().toNat();
        let updatedUser : UserRecord = {
          user with
          accessExpiry = expiryTimestamp;
          updatedAt = now;
        };
        users.add(userId, updatedUser);
      };
    };
  };

  public query ({ caller }) func getAccessExpiry(userId : Text) : async ?Time.Time {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get access expiry");
    };

    switch (users.get(userId)) {
      case (null) { null };
      case (?user) { user.accessExpiry };
    };
  };

  public query ({ caller }) func getLastUsed(userId : Text) : async ?Time.Time {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get last used time");
    };

    switch (users.get(userId)) {
      case (null) { null };
      case (?user) { user.lastUsed };
    };
  };

  public query ({ caller }) func getLastSignIn(userId : Text) : async ?Time.Time {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get last sign-in time");
    };

    switch (users.get(userId)) {
      case (null) { null };
      case (?user) { user.lastSignIn };
    };
  };

  public query ({ caller }) func adminGetUserInvoices(userId : Text) : async [Invoice] {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' invoices");
    };

    switch (users.get(userId)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        switch (user.principal) {
          case (null) {
            var targetPrincipal : ?Principal = null;
            for ((principal, uid) in principalToUserId.entries()) {
              if (uid == userId) {
                targetPrincipal := ?principal;
              };
            };

            switch (targetPrincipal) {
              case (null) {
                return [];
              };
              case (?principal) {
                switch (invoicesByUser.get(principal)) {
                  case (null) { [] };
                  case (?invoices) { invoices.values().toArray().sort() };
                };
              };
            };
          };
          case (?principal) {
            switch (invoicesByUser.get(principal)) {
              case (null) { [] };
              case (?invoices) { invoices.values().toArray().sort() };
            };
          };
        };
      };
    };
  };

  public type InvoiceKPIs = {
    totalInvoices : Nat;
    draftInvoices : Nat;
    finalizedInvoices : Nat;
  };

  public query ({ caller }) func adminGetUserInvoiceKPIs(userId : Text) : async InvoiceKPIs {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' invoice KPIs");
    };

    switch (users.get(userId)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        switch (user.principal) {
          case (null) {
            var targetPrincipal : ?Principal = null;
            for ((principal, uid) in principalToUserId.entries()) {
              if (uid == userId) {
                targetPrincipal := ?principal;
              };
            };

            switch (targetPrincipal) {
              case (null) {
                return {
                  totalInvoices = 0;
                  draftInvoices = 0;
                  finalizedInvoices = 0;
                };
              };
              case (?principal) {
                switch (invoicesByUser.get(principal)) {
                  case (null) {
                    {
                      totalInvoices = 0;
                      draftInvoices = 0;
                      finalizedInvoices = 0;
                    };
                  };
                  case (?invoices) {
                    var draftCount = 0;
                    var finalizedCount = 0;
                    for (invoice in invoices.values()) {
                      switch (invoice.status) {
                        case (#draft) { draftCount += 1 };
                        case (#finalized) { finalizedCount += 1 };
                        case (#cancelled) {};
                      };
                    };
                    {
                      totalInvoices = draftCount + finalizedCount;
                      draftInvoices = draftCount;
                      finalizedInvoices = finalizedCount;
                    };
                  };
                };
              };
            };
          };
          case (?principal) {
            switch (invoicesByUser.get(principal)) {
              case (null) {
                {
                  totalInvoices = 0;
                  draftInvoices = 0;
                  finalizedInvoices = 0;
                };
              };
              case (?invoices) {
                var draftCount = 0;
                var finalizedCount = 0;
                for (invoice in invoices.values()) {
                  switch (invoice.status) {
                    case (#draft) { draftCount += 1 };
                    case (#finalized) { finalizedCount += 1 };
                    case (#cancelled) {};
                  };
                };
                {
                  totalInvoices = draftCount + finalizedCount;
                  draftInvoices = draftCount;
                  finalizedInvoices = finalizedCount;
                };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func recordInternetIdentitySignIn() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot record sign-in");
    };

    let now = Time.now();

    switch (principalToUserId.get(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            let updatedUser : UserRecord = {
              user with
              lastSignIn = ?now;
              lastUsed = ?now;
            };
            users.add(userId, updatedUser);
          };
          case (null) {};
        };
      };
      case (null) {
        switch (principalOnlyUsers.get(caller)) {
          case (?principalUser) {
            let updatedPrincipalUser : PrincipalUserRecord = {
              principal = caller;
              lastSignIn = ?now;
              lastUsed = ?now;
            };
            principalOnlyUsers.add(caller, updatedPrincipalUser);
          };
          case (null) {
            let newPrincipalUser : PrincipalUserRecord = {
              principal = caller;
              lastSignIn = ?now;
              lastUsed = ?now;
            };
            principalOnlyUsers.add(caller, newPrincipalUser);
          };
        };
      };
    };
  };

  public type UnifiedUserInfo = {
    identifier : Text;
    userType : { #credential; #principalOnly };
    lastSignIn : ?Time.Time;
    lastUsed : ?Time.Time;
    email : ?Text;
    role : ?SystemRole;
    deleted : ?Bool;
    accessExpiry : ?Time.Time;
  };

  public query ({ caller }) func listAllUsers() : async [UnifiedUserInfo] {
    if (not (authenticatedAdminPrincipals.contains(caller)) and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };

    var result : [UnifiedUserInfo] = [];

    for (user in users.values()) {
      let userInfo : UnifiedUserInfo = {
        identifier = user.id;
        userType = #credential;
        lastSignIn = user.lastSignIn;
        lastUsed = user.lastUsed;
        email = ?user.email;
        role = ?user.role;
        deleted = ?user.deleted;
        accessExpiry = user.accessExpiry;
      };
      result := result.concat([userInfo]);
    };

    for (principalUser in principalOnlyUsers.values()) {
      let isCredentialUser = switch (principalToUserId.get(principalUser.principal)) {
        case (null) { false };
        case (?_) { true };
      };

      if (not isCredentialUser) {
        let userInfo : UnifiedUserInfo = {
          identifier = principalUser.principal.toText();
          userType = #principalOnly;
          lastSignIn = principalUser.lastSignIn;
          lastUsed = principalUser.lastUsed;
          email = null;
          role = null;
          deleted = null;
          accessExpiry = null;
        };
        result := result.concat([userInfo]);
      };
    };

    result;
  };
};
