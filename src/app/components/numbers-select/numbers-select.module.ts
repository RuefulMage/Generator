import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumbersSelectComponent } from './numbers-select.component';



@NgModule({
  declarations: [
    NumbersSelectComponent
  ],
  exports: [
    NumbersSelectComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NumbersSelectModule { }
