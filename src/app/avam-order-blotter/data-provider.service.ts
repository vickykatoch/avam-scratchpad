import { Utils } from './../utils/Utils';
import { IOrder } from './model';
import { Injectable } from '@angular/core';

const STATUS_LIST = ['NEW', 'FILLED', 'CANCELLED', 'PARTIALLY_FILLED', 'SUSPENDED'];



@Injectable()
export class ClientDataProviderService {
      private orders: IOrder[] = [];

      getRandomData(count? : number) : IOrder[] {
            count = count || 5;
            return this.generateNewOrderData(2);
      }

      private generateNewOrderData(count: number) : IOrder[] {
            return <IOrder[]>[{
                  orderId           : '1',
                  qty               : 10,
                  price             : 100.23,
                  remainingQty      : 5,
                  status            : 'CANCELLED',
                  reason            : '',
                  exchange          : 'S-CASH'
            }];
      }
      private getRandomIndexFromArray(array: any[]) : any {
            const index = Utils.getRandomNum(0,array.length);
            return array[index];
      }
      private generateOrderId() {
            return '';
      }
}