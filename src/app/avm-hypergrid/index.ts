import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvmHypergridComponent } from './avm-hypergrid.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
        AvmHypergridComponent
  ], 
  exports : [
        AvmHypergridComponent
  ]
})
export class AvmHypergridModule { }