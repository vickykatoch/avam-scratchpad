import { ServerDataProvider } from './server-dataprovider.service';
import { Subscription } from 'rxjs/Subscription';
import { Utils } from './../utils/Utils';
import { IOrder } from './model';
import { ClientDataProviderService } from './data-provider.service';
import { DataSimulatorService } from './data-simulator.service';
import { GridThemeService } from './gridTheme';
import { DataHelper } from './data';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { GridDataHelper } from "app/avam-order-blotter/grid-data.helper";

let windowRef = (): any => window;

@Component({
  selector: 'avam-order-blotter',
  providers: [GridThemeService, ClientDataProviderService, DataSimulatorService, ServerDataProvider],
  templateUrl: './avam-order-blotter.component.html',
  styleUrls: ['./avam-order-blotter.component.scss']
})
export class AvamOrderBlotterComponent implements OnInit {
  @ViewChild('gridHost') gridHost;
  grid: any;
  private orders : IOrder[] = [];
  private ordersData : {[key: string] : IOrder} = {};
  private orderCount : number = 0;
  private sub : Subscription;
  private gridDataHelper : GridDataHelper = new GridDataHelper();
  

  constructor(private themeService: GridThemeService, private dataService: DataSimulatorService) { }

  ngOnInit() {
    this.initGrid();
    this.dataService.orders$.subscribe(this.processData.bind(this));
  }
  onUpdate(value: boolean) {
    this.dataService.updateOptions({ type: 1 });
  }
  onStart(): void {
    this.dataService.start({});
  }
  onStop() : void {
    this.dataService.stop();
  }
  private initGrid() : void {
    const win = windowRef();
    this.grid = new win.fin.Hypergrid(this.gridHost.nativeElement, { 
        data : this.orders,
        schema : this.gridDataHelper.getSchema(),
        margin : { bottom : '10px', right : '10px' }
    });
    this.grid.addProperties(this.themeService.getTheme());
  }

  private processData(data: IOrder[]) : void {
    if(data && data.length > 0) {
      let repaintOnly : boolean = true;
      data.forEach(order=> {
        if(this.ordersData[order.orderId]) {
          repaintOnly = true;
        } 
        this.ordersData[order.orderId] = order;
      });
      /*if(this.orders.length ===0) {
          this.orders.push(...data);
      } else {
          data.forEach(order=> {
            const idx = _.findIndex(this.orders, (o: IOrder)=> o.orderId === order.orderId);
            if(idx && idx>0) {
              this.orders[idx] = order;
            } else {
              this.orders.push(order);
            }
            this.ordersData[order.orderId] = order;
          });
      }*/
      this.refreshUI(repaintOnly);
    }
  }
  private refreshUI(repaintOnly: boolean) {
    if(this.grid) {
      this.orders = _.values(this.ordersData);
      this.orderCount = this.orders.length;
      if(repaintOnly) {
        this.grid.repaint();
      } else {
        this.grid.setData(this.orders); 
      }
    }
  }
}
