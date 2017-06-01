import { Injectable } from '@angular/core';

@Injectable()
export class GridThemeService {

      private themes: { [key: string]: any } = {};

      constructor() {
            this.themes['one'] = {
                  font: '12px Tahoma, Geneva, sans-serif',
                  color: '#fff',
                  backgroundColor: '#333131',
                  foregroundSelectionColor: 'rgb(255, 0, 0)',
                  backgroundSelectionColor: 'rgb(0, 0, 255)',

                  columnHeaderFont: '12px Tahoma, Geneva, sans-serif',
                  columnHeaderColor: '#fff',
                  columnHeaderBackgroundColor: '#0A0808',
                  columnHeaderForegroundSelectionColor: 'rgb(0, 0, 255)',
                  columnHeaderBackgroundSelectionColor: 'rgb(255, 0, 0)',

                  rowHeaderFont: '12px Tahoma, Geneva, sans-serif',
                  rowHeaderColor: 'rgb(25, 25, 25)',
                  rowHeaderBackgroundColor: 'rgb(223, 227, 232)',
                  rowHeaderForegroundSelectionColor: 'red',
                  rowHeaderBackgroundSelectionColor: 'green',

                  backgroundColor2: 'rgb(201, 201, 201)',
                  lineColor: 'rgb(199, 199, 199)',
                  voffset: 0,
                  scrollbarHoverOver: 'visible',
                  scrollbarHoverOff: 'hidden',
                  scrollingEnabled: true,

                  fixedRowAlign: 'center',
                  fixedColAlign: 'center',
                  cellPadding: 5,
                  gridLinesH: true,
                  gridLinesV: true,

                  defaultRowHeight: 25,
                  defaultFixedRowHeight: 20,
                  defaultColumnWidth: 100,
                  defaultFixedColumnWidth: 100,

                  //for immediate painting, set these values to 0, true respectively

                  editorActivationKeys: ['alt', 'esc'],
                  columnAutosizing: false,
                  readOnly: false,
                  rows: {
                        header: {
                              0: {
                                    height: 30
                              }
                        }
                  }
            };
      }
      getTheme(): any {
            return this.themes['one'];
      }
}