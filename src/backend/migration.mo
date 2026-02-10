import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Set "mo:core/Set";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldBusinessProfile = {
    businessName : Text;
    address : Text;
    gstin : Text;
    state : Text;
    invoicePrefix : Text;
    startingNumber : Nat;
    logo : ?Storage.ExternalBlob;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, { name : Text }>;
    businessProfiles : Map.Map<Principal, OldBusinessProfile>;
    customersByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; name : Text; billingAddress : Text; gstin : ?Text; state : Text; contactInfo : ?Text }>>;
    itemsByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; name : Text; description : ?Text; hsnSac : ?Text; unitPrice : Float; defaultGstRate : Float }>>;
    invoicesByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; invoiceNumber : Text; purchaseOrderNumber : ?Text; customerId : Nat; lineItems : [{ itemId : Nat; quantity : Float; unitPrice : Float; discount : ?Float }]; status : { #draft; #finalized; #cancelled }; invoiceDate : Text; invoiceType : { #original; #transportation } }>>;
    nextCustomerId : Nat;
    nextItemId : Nat;
    nextInvoiceId : Nat;
    users : Map.Map<Text, {
      id : Text;
      email : Text;
      passwordHash : Text;
      mobileNumber : Text;
      role : { #superAdmin; #auditor; #standard };
      permissions : {
        canUseGstValidation : Bool;
        canVerifyPan : Bool;
        canVerifyBank : Bool;
        canFileReturns : Bool;
        canExportData : Bool;
        canManageUsers : Bool;
        canViewReports : Bool;
      };
      createdAt : Nat;
      updatedAt : Nat;
      deleted : Bool;
      principal : ?Principal;
      accessExpiry : ?Time.Time;
      lastUsed : ?Time.Time;
      lastSignIn : ?Time.Time;
    }>;
    deletedUsers : Set.Set<Text>;
    authenticatedAdminPrincipals : Set.Set<Principal>;
    principalToUserId : Map.Map<Principal, Text>;
    principalOnlyUsers : Map.Map<Principal, { principal : Principal; lastSignIn : ?Time.Time; lastUsed : ?Time.Time }>;
  };

  type NewBusinessProfile = {
    businessName : Text;
    address : Text;
    gstin : Text;
    state : Text;
    invoicePrefix : Text;
    startingNumber : Nat;
    logo : ?Storage.ExternalBlob;
    bankingDetails : ?{
      accountName : Text;
      accountNumber : Text;
      ifscCode : Text;
      bankName : Text;
      branch : ?Text;
    };
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, { name : Text }>;
    businessProfiles : Map.Map<Principal, NewBusinessProfile>;
    customersByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; name : Text; billingAddress : Text; gstin : ?Text; state : Text; contactInfo : ?Text }>>;
    itemsByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; name : Text; description : ?Text; hsnSac : ?Text; unitPrice : Float; defaultGstRate : Float }>>;
    invoicesByUser : Map.Map<Principal, Map.Map<Nat, { id : Nat; invoiceNumber : Text; purchaseOrderNumber : ?Text; customerId : Nat; lineItems : [{ itemId : Nat; quantity : Float; unitPrice : Float; discount : ?Float }]; status : { #draft; #finalized; #cancelled }; invoiceDate : Text; invoiceType : { #original; #transportation } }>>;
    nextCustomerId : Nat;
    nextItemId : Nat;
    nextInvoiceId : Nat;
    users : Map.Map<Text, {
      id : Text;
      email : Text;
      passwordHash : Text;
      mobileNumber : Text;
      role : { #superAdmin; #auditor; #standard };
      permissions : {
        canUseGstValidation : Bool;
        canVerifyPan : Bool;
        canVerifyBank : Bool;
        canFileReturns : Bool;
        canExportData : Bool;
        canManageUsers : Bool;
        canViewReports : Bool;
      };
      createdAt : Nat;
      updatedAt : Nat;
      deleted : Bool;
      principal : ?Principal;
      accessExpiry : ?Time.Time;
      lastUsed : ?Time.Time;
      lastSignIn : ?Time.Time;
    }>;
    deletedUsers : Set.Set<Text>;
    authenticatedAdminPrincipals : Set.Set<Principal>;
    principalToUserId : Map.Map<Principal, Text>;
    principalOnlyUsers : Map.Map<Principal, { principal : Principal; lastSignIn : ?Time.Time; lastUsed : ?Time.Time }>;
  };

  public func run(old : OldActor) : NewActor {
    let newBusinessProfiles = old.businessProfiles.map<Principal, OldBusinessProfile, NewBusinessProfile>(
      func(_principal, oldBusinessProfile) {
        { oldBusinessProfile with bankingDetails = null };
      }
    );
    { old with businessProfiles = newBusinessProfiles };
  };
};
