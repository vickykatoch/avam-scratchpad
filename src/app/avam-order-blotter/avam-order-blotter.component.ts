import { IOrder } from './model';
import { ClientDataProviderService } from './data-provider.service';
import { DataSimulatorService } from './data-simulator.service';
import { GridThemeService } from './gridTheme';
import { DataHelper } from './data';
import { Component, OnInit, ViewChild } from '@angular/core';

let windowRef = (): any => window;

@Component({
  selector: 'avam-order-blotter',
  providers: [GridThemeService, ClientDataProviderService, DataSimulatorService],
  templateUrl: './avam-order-blotter.component.html',
  styleUrls: ['./avam-order-blotter.component.scss']
})
export class AvamOrderBlotterComponent implements OnInit {
  @ViewChild('gridHost') gridHost;
  grid: any;
  private ordersData : IOrder[] = [];
  

  constructor(private themeService: GridThemeService, private dataService: DataSimulatorService) { }

  ngOnInit() {
    this.initGrid();
  }

  onStart(): void {
    this.dataService.orders$.subscribe(this.processData.bind(this));
    this.dataService.start();
  }

  private initGrid() : void {
    const win = windowRef();
    this.grid = new win.fin.Hypergrid(this.gridHost.nativeElement);
    this.grid.setData(this.ordersData);
    this.grid.addProperties(this.themeService.getTheme());
  }

  private processData(data: IOrder[]) : void {
    if(data && data.length > 0) {
      this.ordersData = data;
      this.refreshUI();
    }
  }
  private refreshUI() {
    if(this.grid) {
      this.grid.setData(this.ordersData);
      // this.grid.repaint();
    }
  }
}
