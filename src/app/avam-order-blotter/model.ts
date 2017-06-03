export interface IOrder {
      orderId           : string;
      price             : number;
      qty               : number;
      remainingQty      : number;
      status            : string;
      children?         : any;
      reason?           : string;
      exchange          : string;
}