import { Observable } from 'rxjs/Observable';
import { Utils } from './../utils/Utils';
import { IOrder } from './model';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

const STATUS_LIST             = ['NEW', 'FILLED', 'CANCELLED', 'PARTIALLY_FILLED', 'SUSPENDED', 'PENDING', 'REJECTED'];
const SIDES                   = ['BUY','SELL'];
const DESTINATION_LIST        = ['ESPD','XCME','SONAR','SOR-CASH','SOR','DWEB','BTEC','SPREADER','SOR-FUTURE', 'SPREADER','SPREADER-FUTURE','QMM', 'XHUB','XHUB-TSY'];
const SYMBOLS                 = ['2_YEAR', '3_YEAR','5_YEAR', '7_YEAR','10_YEAR', '30_YEAR', 'ED1', 'ED2', 'ED3', 'ED4', 'ED5', 'ED6', 'ED7', 'ED8'];
const ORDER_TYPES             = ['ONE','TWO'];
const PROFILES                = ['PROFILE 1','PROFILE 2', 'PROFILE 3'];
const TEXT                    = ['Im  text','No Error found', '', '',''];
const BOOLEANS                = [true,false];
const STRATEGIES              = ['STRATEGIES 1', 'STRATEGIES 2', '' ,'STRATEGIES 3', '' , '', '','STRATEGIES 4'];
const ACCOUNTS                = ['BASIC', 'CHECKING', 'SAVING', 'INVESTMENT'];
const PORTFOLIOS              = ['', '', 'XD345','Y3434', 'R3434','','','','','H345'];

@Injectable()
export class ClientDataProviderService {
      private orders: {[key:string] : IOrder} = {};
      private CLR_IDS : string[] = [];

      constructor() {
            for(let i=0;i<100;i++) {
                  this.CLR_IDS.push(this.generateUUID());
            }
      }

      getRandomData(type: number =0,count? : number, childCount?: number) : IOrder[] {
            count = count || 50;
            const genOrders : IOrder[] = [];
            for(var i=0;i<count;i++) {
                  let isNew = <boolean>this.getRandomValueFromArray(BOOLEANS);
                  let order : IOrder;
                  childCount = childCount || 5;
                  if(type===0) { 
                        let isVanilla = <boolean>this.getRandomValueFromArray(BOOLEANS);
                        order = isVanilla ? this.generateNewOrder() : this.generateOrderWithChildren(childCount);
                  } if(type===1) { // Only updated data
                        order = this.getModifiedOrder();
                  } else { // Generate hybrid of new and updated orders
                        if(isNew) {
                              let isVanilla = <boolean>this.getRandomValueFromArray(BOOLEANS);
                              order = isVanilla ? this.generateNewOrder() : this.generateOrderWithChildren(childCount);
                        } else {
                              order = this.getModifiedOrder();
                        }
                  }
                  genOrders.push(order);
                  this.orders[order.orderId] = order;
            }
            return genOrders;
      }
      private generateOrderWithChildren(childrenCount: number) : IOrder {
            const order = this.generateNewOrder();
            order.children = {};
            for(let x =0; x<childrenCount;x++) {
                  const corder = this.generateNewOrder();
                  order.children[corder.orderId] = corder;
            }
            return order;
      }
      
      private generateNewOrder() : IOrder {
            return {
                  symbol            : <string>this.getRandomValueFromArray(SYMBOLS),
                  orderId           : <string>this.generateUUID(),
                  exDestination     : <string>this.getRandomValueFromArray(DESTINATION_LIST),
                  lastMarket        : '',
                  profile           : <string>this.getRandomValueFromArray(PROFILES),
                  side              : <string>this.getRandomValueFromArray(SIDES),
                  qtyTotal          : this.getRandomNumber(1,100),
                  leavesQty         : this.getRandomNumber(1,100),
                  orderStatus       : <string>this.getRandomValueFromArray(STATUS_LIST),
                  transactionTime   : Date.now(),
                  price             : this.getRandomNumber(99.30,103.75, true),
                  lastPrice         : this.getRandomNumber(99.30,103.75, true),
                  orderType         : <string>this.getRandomValueFromArray(ORDER_TYPES),
                  sendingTime       : Date.now(),
                  qtyShown          : this.getRandomNumber(1,100),
                  cumQty            : this.getRandomNumber(1,100),
                  lastQty           : this.getRandomNumber(1,100),
                  avgPrice          : this.getRandomNumber(99.30,103.75, true),
                  tradedPercentage  : this.getRandomNumber(1,100),
                  text              : <string>this.getRandomValueFromArray(TEXT),
                  isActive          : <boolean>this.getRandomValueFromArray(BOOLEANS),
                  clOrdId           : <string>this.getRandomValueFromArray(this.CLR_IDS),
                  origClOrdId       : <string>this.getRandomValueFromArray(this.CLR_IDS),
                  strategy          : <string>this.getRandomValueFromArray(STRATEGIES),
                  account           : <string>this.getRandomValueFromArray(ACCOUNTS),
                  portfolio         : <string>this.getRandomValueFromArray(PORTFOLIOS)               
            };
      }
      private getModifiedOrder() : IOrder {
            let order  = <IOrder>this.getRandomValueFromArray(_.values(this.orders));
            if(order) {
                  order = this.modifyOrder(order);
                  if(order.children) {
                        Object.keys(order.children).forEach((key: string) => {
                              order.children[key] = this.modifyOrder(order.children[key]);
                        });
                  }
            } else {
                  order = this.generateNewOrder();
            }
            return order;
      }
      private modifyOrder(order: IOrder) : IOrder {
            order.qtyTotal          = this.getRandomNumber(1,100);
            order.leavesQty         = this.getRandomNumber(1,100);
            order.orderStatus       = <string>this.getRandomValueFromArray(STATUS_LIST);
            order.transactionTime   = Date.now();
            order.price             = this.getRandomNumber(99.30,103.75, true);
            order.lastPrice         = this.getRandomNumber(99.30,103.75, true);
            order.orderType         = <string>this.getRandomValueFromArray(ORDER_TYPES);
            order.sendingTime       = Date.now();
            order.qtyShown          = this.getRandomNumber(1,100);
            order.cumQty            = this.getRandomNumber(1,100);
            order.lastQty           = this.getRandomNumber(1,100);
            order.avgPrice          = this.getRandomNumber(99.30,103.75, true);
            order.tradedPercentage  = this.getRandomNumber(1,100);
            order.text              = <string>this.getRandomValueFromArray(TEXT);
            order.isActive          = <boolean>this.getRandomValueFromArray(BOOLEANS);
            order.clOrdId           = <string>this.getRandomValueFromArray(this.CLR_IDS);
            order.origClOrdId       = <string>this.getRandomValueFromArray(this.CLR_IDS);
            order.strategy          = <string>this.getRandomValueFromArray(STRATEGIES);
            order.account           = <string>this.getRandomValueFromArray(ACCOUNTS);
            order.portfolio         = <string>this.getRandomValueFromArray(PORTFOLIOS);   
            return order;
      }
      private getRandomValueFromArray(array: any[]) : any {
            const index = Utils.getRandomNum(0,array.length);
            return array[index];
      }
      private getRandomNumber(min: number, max: number, dec?: boolean) : number {
            return Math.floor((Math.random() * max) + min);
      }
      private generateUUID () { // Public Domain/MIT
            let d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
                  d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                  var r = (d + Math.random() * 16) % 16 | 0;
                  d = Math.floor(d / 16);
                  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
      }
}