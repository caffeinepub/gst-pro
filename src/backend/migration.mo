import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldInvoice = {
    id : Nat;
    customerId : Nat;
    lineItems : [LineItem];
    status : InvoiceStatus;
    invoiceDate : Text;
  };

  type NewInvoice = {
    id : Nat;
    invoiceNumber : Text;
    purchaseOrderNumber : ?Text;
    customerId : Nat;
    lineItems : [LineItem];
    status : InvoiceStatus;
    invoiceDate : Text;
  };

  type OldActor = {
    invoicesByUser : Map.Map<Principal, Map.Map<Nat, OldInvoice>>;
  };

  type NewActor = {
    invoicesByUser : Map.Map<Principal, Map.Map<Nat, NewInvoice>>;
  };

  type LineItem = {
    itemId : Nat;
    quantity : Float;
    unitPrice : Float;
    discount : ?Float;
  };

  type InvoiceStatus = {
    #draft;
    #finalized;
  };

  public func run(old : OldActor) : NewActor {
    let newInvoicesByUser = old.invoicesByUser.map<Principal, Map.Map<Nat, OldInvoice>, Map.Map<Nat, NewInvoice>>(
      func(_id, oldInvoices) {
        oldInvoices.map<Nat, OldInvoice, NewInvoice>(
          func(_id, oldInvoice) {
            {
              oldInvoice with
              invoiceNumber = "default";
              purchaseOrderNumber = null;
            };
          }
        );
      }
    );
    { invoicesByUser = newInvoicesByUser };
  };
};
