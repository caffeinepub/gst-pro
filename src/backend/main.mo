import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  public type BusinessProfile = {
    businessName : Text;
    address : Text;
    gstin : Text;
    state : Text;
    invoicePrefix : Text;
    startingNumber : Nat;
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

  public type InvoiceStatus = {
    #draft;
    #finalized;
  };

  public type Invoice = {
    id : Nat;
    customerId : Nat;
    lineItems : [LineItem];
    status : InvoiceStatus;
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

  // Stable Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let businessProfiles = Map.empty<Principal, BusinessProfile>();
  let customersByUser = Map.empty<Principal, Map.Map<Nat, Customer>>();
  let itemsByUser = Map.empty<Principal, Map.Map<Nat, Item>>();
  let invoicesByUser = Map.empty<Principal, Map.Map<Nat, Invoice>>();

  // User Profile Methods
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
    userProfiles.add(caller, profile);
  };

  // Business Profile Methods
  public shared ({ caller }) func saveBusinessProfile(profile : BusinessProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save business profiles");
    };
    businessProfiles.add(caller, profile);
  };

  public query ({ caller }) func getBusinessProfile() : async ?BusinessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view business profiles");
    };
    businessProfiles.get(caller);
  };

  // Helper Functions
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

  // Customer Methods
  public shared ({ caller }) func addCustomer(name : Text, billingAddress : Text, gstin : ?Text, state : Text, contactInfo : ?Text) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };

    let customers = getOrCreateCustomerMap(caller);
    let newId = customers.size() + 1;
    let customer : Customer = {
      id = newId;
      name;
      billingAddress;
      gstin;
      state;
      contactInfo;
    };
    customers.add(newId, customer);
    customer;
  };

  public shared ({ caller }) func editCustomer(id : Nat, name : Text, billingAddress : Text, gstin : ?Text, state : Text, contactInfo : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit customers");
    };

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

    let customers = getOrCreateCustomerMap(caller);
    customers.remove(id);
  };

  // Item/Service Methods
  public shared ({ caller }) func addItem(name : Text, description : ?Text, hsnSac : ?Text, unitPrice : Float, defaultGstRate : Float) : async Item {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };

    let items = getOrCreateItemMap(caller);
    let newId = items.size() + 1;
    let item : Item = {
      id = newId;
      name;
      description;
      hsnSac;
      unitPrice;
      defaultGstRate;
    };
    items.add(newId, item);
    item;
  };

  public shared ({ caller }) func editItem(id : Nat, name : Text, description : ?Text, hsnSac : ?Text, unitPrice : Float, defaultGstRate : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit items");
    };

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

    let items = getOrCreateItemMap(caller);
    items.remove(id);
  };

  // Invoice Methods
  public shared ({ caller }) func createInvoice(customerId : Nat, lineItems : [LineItem]) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };

    // Verify customer exists and belongs to caller
    let customers = getOrCreateCustomerMap(caller);
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?_) {};
    };

    let invoices = getOrCreateInvoiceMap(caller);
    let newId = invoices.size() + 1;
    let invoice : Invoice = {
      id = newId;
      customerId;
      lineItems;
      status = #draft;
    };
    invoices.add(newId, invoice);
    invoice;
  };

  public shared ({ caller }) func editInvoice(id : Nat, customerId : Nat, lineItems : [LineItem], status : InvoiceStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit invoices");
    };

    // Verify customer exists and belongs to caller
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
          customerId;
          lineItems;
          status;
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
      case (?invoices) { invoices.values().toArray().sort() };
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

    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?invoice) {
        // Safe deletion rule: only allow deletion of draft invoices
        switch (invoice.status) {
          case (#draft) {
            invoices.remove(id);
          };
          case (#finalized) {
            Runtime.trap("Cannot delete finalized invoices");
          };
        };
      };
    };
  };

  public shared ({ caller }) func finalizeInvoice(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finalize invoices");
    };

    let invoices = getOrCreateInvoiceMap(caller);
    switch (invoices.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?invoice) {
        let updatedInvoice : Invoice = {
          id = invoice.id;
          customerId = invoice.customerId;
          lineItems = invoice.lineItems;
          status = #finalized;
        };
        invoices.add(id, updatedInvoice);
      };
    };
  };
};
