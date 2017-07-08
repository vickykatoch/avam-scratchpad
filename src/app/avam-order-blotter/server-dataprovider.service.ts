import {Injectable} from '@angular/core';
import * as io from "socket.io-client";
import { Http } from "@angular/http";

@Injectable()
export class ServerDataProvider {
      private socket : any;


      constructor(private http: Http) {

      }

      start() {
            // this.http.get('/api/test')
            // .subscribe(x=> {
            //       debugger;
            //       console.log(x);
            // })
            this.socket = io('http://localhost:4200/api');
            this.socket.on('live-data', function (data) {
                  console.log('Data : ', data);
            }.bind(this));
      }
}