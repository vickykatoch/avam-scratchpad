import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvamCanvasGridComponent } from './avam-canvas-grid.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AvamCanvasGridComponent
  ],
  exports : [
    AvamCanvasGridComponent
  ]
})
export class AvamCanvasGridModule { }