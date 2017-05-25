export class GridSorter {
      private columnIndex : number;
      private index : Array<number>;
      private data : any;
      constructor(private grid : any) {
            this.data =  this.grid.options.data;
            grid.addEventListener('fin-column-sort', (event) => {
                  var c = event.detail.column;
                  this.toggleSort(c);
            });
            this.index = new Array(this.data.length);
            this.unsort();
      }
      toggleSort(c) {
            if (this.columnIndex) {
                    //grid.behavior.setCellProperty(c, 0, 'rightIcon', '');
                  this.grid.behavior.getColumn(this.columnIndex).properties.backgroundColor = "white";
            }
            this.columnIndex = c;
            //grid.behavior.setCellProperty(this.columnIndex, 0, 'rightIcon', 'down-rectangle');
            this.grid.behavior.getColumn(this.columnIndex).properties.backgroundColor = "blue";
            this.sort();
            
            this.grid.behavior.changed();
            this.grid.repaint();
      }
      ascendingComparator(a,b) : number {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            // a must be equal to b
            return 0;
      }
      descendingComparator(a,b) : number {
            //Handles string and number comparisons
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            // a must be equal to b
            return 0;
      }
      sort() {
            //Sort the index
            var field = this.grid.behavior.getColumn(this.columnIndex).properties.name;
            var self = this;
            this.index.sort(function(a, b) {
                var i = self.data[a][field],
                    j = self.data[b][field];
                return self.descendingComparator(i, j);
            });
      }
      unsort() {
            for(var i = 0; i< this.index.length; i++){
                this.index[i] = i;
            }
      }
}