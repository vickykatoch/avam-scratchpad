import { ClientDataProviderService } from './data-provider.service';
import { Observable } from 'rxjs/Observable';
import { IOrder } from './model';
import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

@Injectable()
export class DataSimulatorService {
  private isStarted : boolean = false;
  private ordersSubject   : Subject<IOrder[]> = new Subject<IOrder[]>();
  public orders$         : Observable<IOrder[]> = this.ordersSubject.asObservable();

  constructor(private dataProvider: ClientDataProviderService) { }

  start(provider?: string, frequency?: number) {
    if(provider) {
      this.startOrdersServerSimulator();
    } else {
      this.startOrdersClientSimulator();
    }
  }

  private startOrdersClientSimulator(frequency?: number) {
    frequency = frequency || 500;
    Observable.interval(frequency)
      .subscribe(i=> {
        this.ordersSubject.next(this.dataProvider.getRandomData());
      });
  }
  private startOrdersServerSimulator() {

  }
}
