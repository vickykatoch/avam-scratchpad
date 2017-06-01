import { DataHelper } from './data';
import { Component, OnInit, ViewChild } from '@angular/core';

let windowRef = () : any => window;

@Component({
  selector: 'avam-order-blotter',
  templateUrl: './avam-order-blotter.component.html',
  styleUrls: ['./avam-order-blotter.component.scss']
})
export class AvamOrderBlotterComponent implements OnInit {
  @ViewChild('gridHost') gridHost;
  grid                  : any;

  constructor() { }

  ngOnInit() {
    
    console.log(this.gridHost.nativeElement);
  }

  onStart() : void {
    const win = windowRef();
    this.grid = new win.fin.Hypergrid(this.gridHost.nativeElement, this.getOptions());
  }

  private getOptions() {
    return {
        data : DataHelper.getInitialData(),
        margin: { bottom: '15px', right: '10px'},
        state: { color: 'black' },
        height : 600,
        defaultRowHeight: 30,
        cellPadding: 20,
        defaultFixedRowHeight: 20,
        rows: {
              header: {
                  0: {
                      height: 40
                  }
              }
          }
    };
  }

}
