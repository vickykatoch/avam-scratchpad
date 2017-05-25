import { LeafNode, GroupNode } from './groupNode';


export class ComputeEngine {
      private ageGrouped : boolean = false;
      private drillDownCharMap : any = {
            OPEN: '\u25bc', // BLACK DOWN-POINTING TRIANGLE aka '▼'
            CLOSE: '\u25b6' // BLACK RIGHT-POINTING TRIANGLE aka '▶'
      };
      private _data : any[] = [
            { age: 10, name: 'Joe', sport: 'Basketball' },
            { age: 10, name: 'Susan', sport: 'Soccer' },
            { age: 12, name: 'Mike', sport: 'Gymnastics' },
            { age: 12, name: 'Michelle', sport: 'Ballet' },
            { age: 13, name: 'Michelle', sport: 'Ballet 13' }
      ];
      private treeColumnarData : any[] = [];
      private view : any[] = [];
      private groups : any = {};

      constructor(private grid: any) {
            
            this.buildView();
            grid.mixIn.call(grid.behavior.dataModel,this.getDataModelExt());

      }
      toggleGroups() {
            var self = this;
            this.grid.clearSelections();
            this.ageGrouped = !this.ageGrouped;
            if (this.ageGrouped){
                  this.groups = {};
                  this._data.forEach(function(cv, i){
                        if (!self.groups[cv.age]){
                              self.groups[cv.age] = {};
                        }
                        self.groups[cv.age].__EXPANDED = self.groups[cv.age].__EXPANDED || false;
                        self.groups[cv.age].leaves =  self.groups[cv.age].leaves || [];
                        self.groups[cv.age].leaves.push(i);
                  });
            }
            this.buildView();
            this.grid.behavior.changed();
      }

      private buildView() : void {
            let groups = this.groups,
                    self = this;
            this.view = [];
            this.treeColumnarData = [];

            if (!this.ageGrouped) {
                  this._data.forEach(function(el){
                        self.view.push(new LeafNode(el));
                  });
                  return;
            }
            for (let k in groups) {
                  if (groups.hasOwnProperty(k)){
                        this.view.push(new GroupNode(k));
                        if (groups[k].__EXPANDED) {
                              this.treeColumnarData.push(this.drillDownCharMap.OPEN + k);
                              for (let i = 0, l = groups[k].leaves; i < l.length; i++) {
                                    this.treeColumnarData.push('');
                                    this.view.push(new LeafNode(this._data[l[i]]));
                              }
                        } else {
                              this.treeColumnarData.push(this.drillDownCharMap.CLOSE + k);
                        }
                  }
            }
      }
      private getDataModelExt() {
            const self = this;
            return {
                isTree : function () {
                    return self.ageGrouped;
                },

                isTreeCol : function (x) {
                    return x === this.grid.behavior.treeColumnIndex;
                },

                isLeafNode: function (y){
                    return self.view[y] instanceof LeafNode;
                },
                getValue: function (x, y) {
                    if (!this.isTreeCol(x)) {
                        var view = self.view[y];
                        return view.getRowArray()[x];
                    }
                    // If its a tree column fetch from column oriented array
                    return self.treeColumnarData[y];
                },
                // If your api will asjust the number of rows shown
                getRowCount: function () {
                  return self.view.length;
                },
                //Clicking the drilldown column
                toggleRow: function (y, expand, event) {
                    var changed = false,
                        view;
                    if (this.isTree(event.dataCell.x) && !this.isLeafNode(event.dataCell.y)){
                        view = self.view[event.dataCell.y];
                        self.groups[view.key].__EXPANDED = !self.groups[view.key].__EXPANDED;
                        self.buildView();
                        changed = true;
                    }
                    return changed;
                },
                // Not necessary to override cellEditors, up to the user
                getCellEditorAt : function(x, y, declaredEditorName, cellEvent) {
                    if (cellEvent.isDataCell && !this.grid.behavior.dataModel.isLeafNode(cellEvent.dataCell.y)) {
                        // Override renderer on parent rows
                        this.cellEditor = undefined;
                    }
                    return this.cellEditor;
                }
            };
      }
}