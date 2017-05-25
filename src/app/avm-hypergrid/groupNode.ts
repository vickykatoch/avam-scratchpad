export class GroupNode {
      constructor(private key: any) {

      }
      getRowArray() : any[] {
            return [1,2,3];
      }
}

export class LeafNode {

      constructor(private row: any) {

      }
      getRowArray() : any[] {
            const _row = this.row;
            let data = [],i = 0;
            for (let col in _row) {
                  if (_row.hasOwnProperty(col)) {
                        data[i] = _row[col];
                        i++;
                  }
            }
            return data;
      }
}