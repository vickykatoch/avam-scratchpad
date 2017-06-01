import { GridThemeService } from './gridTheme';
import { DataHelper } from './data';
import { Component, OnInit, ViewChild } from '@angular/core';

let windowRef = (): any => window;

@Component({
  selector: 'avam-order-blotter',
  providers: [GridThemeService],
  templateUrl: './avam-order-blotter.component.html',
  styleUrls: ['./avam-order-blotter.component.scss']
})
export class AvamOrderBlotterComponent implements OnInit {
  @ViewChild('gridHost') gridHost;
  grid: any;

  constructor(private themeService: GridThemeService) { }

  ngOnInit() {

    console.log(this.gridHost.nativeElement);
  }

  onStart(): void {
    const win = windowRef();
    this.grid = new win.fin.Hypergrid(this.gridHost.nativeElement);
    this.grid.setData(DataHelper.getInitialData());
    this.grid.addProperties(this.themeService.getTheme());
    
  }

  private getOptions() {
    let theme = this.themeService.getTheme();
    Object.assign(theme, {
      data: DataHelper.getInitialData()
    });
    return theme;
  }

}
