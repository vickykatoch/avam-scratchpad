import { AvamCanvasGridModule } from './avam-canvas-grid/avam-canvas-grid.module';
import { AvmHypergridModule } from './avm-hypergrid/index';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AvmHypergridModule,
    AvamCanvasGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
