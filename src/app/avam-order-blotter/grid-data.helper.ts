export class GridDataHelper {
      getSchema() : any[] {
            return [
                  { index: 0, name: "symbol", header : "Symbol", type: "string" },
                  { index: 1, name: "orderId", header : "Order ID", type: "string" },
                  { index: 2, name: "exDestination", header : "Destination", type: "string" }
            ];
      }
}