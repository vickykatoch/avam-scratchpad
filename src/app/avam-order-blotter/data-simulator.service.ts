import { ServerDataProvider } from './server-dataprovider.service';
import { Subscription } from 'rxjs/Subscription';
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
  private sub : Subscription;
  private options : IDataOptions ;

  constructor(private dataProvider: ClientDataProviderService, private serverDS: ServerDataProvider) {
    this.options = {
      provider : 'client',
      frequency: 1000,
      type: 0
    };
  }
  updateOptions(options : IDataOptions) {
    this.options = Object.assign({},this.options, options || {});
  }
  start(options: IDataOptions) {
    this.options = Object.assign({},this.options, options || {});
    if(this.options.provider !== 'client') {
      this.startOrdersServerSimulator();
    } else {
      this.startOrdersClientSimulator(this.options.frequency);
    }
  }
  stop() : void {
    if(this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }

  private startOrdersClientSimulator(frequency?: number) {
    if(!this.sub || this.sub.closed) {
      frequency = frequency || 500;
      this.sub = Observable.interval(frequency)
        .subscribe(i=> {
          this.ordersSubject.next(this.dataProvider.getRandomData(this.options.type));
        });
    }
  }
  private startOrdersServerSimulator() {
    debugger;
    this.serverDS.start();
  }
}
export interface IDataOptions {
  provider?     : string;
  frequency?    : number;
  type?         : number;

}