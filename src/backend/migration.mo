import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldInvoice = {
    id : Nat;
    invoiceNumber : Text;
    purchaseOrderNumber : ?Text;
    customerId : Nat;
    lineItems : [{ itemId : Nat; quantity : Float; unitPrice : Float; discount : ?Float }];
    status : { #draft; #finalized; #cancelled };
    invoiceDate : Text;
    invoiceType : { #original; #transportation };
  };

  type NewInvoice = {
    id : Nat;
    invoiceNumber : Text;
    purchaseOrderNumber : ?Text;
    customerId : Nat;
    lineItems : [{ itemId : Nat; quantity : Float; unitPrice : Float; discount : ?Float }];
    status : { #draft; #finalized; #cancelled };
    invoiceDate : Text;
    invoiceType : { #original; #transportation };
    billToOverride : ?{ name : Text; addressLine1 : Text; addressLine2 : ?Text; city : Text; state : Text; pinCode : Text; contactPerson : Text; phoneNumber : ?Text; gstin : ?Text };
    shipToOverride : ?{ name : Text; addressLine1 : Text; addressLine2 : ?Text; city : Text; state : Text; pinCode : Text; contactPerson : Text; phoneNumber : ?Text; gstin : ?Text };
  };

  public func run(
    old : {
      invoicesByUser : Map.Map<Principal, Map.Map<Nat, OldInvoice>>;
    }
  ) : { invoicesByUser : Map.Map<Principal, Map.Map<Nat, NewInvoice>> } {
    let newInvoicesByUser = old.invoicesByUser.map<Principal, Map.Map<Nat, OldInvoice>, Map.Map<Nat, NewInvoice>>(
      func(_principal, oldInvoices) {
        oldInvoices.map<Nat, OldInvoice, NewInvoice>(
          func(_invId, oldInvoice) {
            { oldInvoice with billToOverride = null; shipToOverride = null };
          }
        );
      }
    );
    { invoicesByUser = newInvoicesByUser };
  };
};
