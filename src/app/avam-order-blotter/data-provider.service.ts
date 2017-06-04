import { Utils } from './../utils/Utils';
import { IOrder } from './model';
import { Injectable } from '@angular/core';


const SYMBOLS                 = ['2_YEAR', '3_YEAR','5_YEAR'];


@Injectable()
export class ClientDataProviderService {
      private orders: IOrder[] = [];

      getRandomData(count? : number) : IOrder[] {
            count = count || 5;
            return this.generateNewOrderData(2);
      }

      private generateNewOrderData(count: number) : IOrder[] {
            return <IOrder[]>[{
                  symbol            : this.getRandomValueFromArray(SYMBOLS),
                  orderId           : this.generateUUID(),                  
                  price             : this.getRandomNumber(99.30,103.75, true),                                 
            }];
      }
      private getRandomValueFromArray(array: any[]) : any {
            const index = Utils.getRandomNum(0,array.length);
            return array[index];
      }
      private generateOrderId() {
            return '';
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