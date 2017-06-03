import { IOrder } from './model';
import { Injectable } from '@angular/core';


@Injectable()
export class ClientDataProviderService {

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
}