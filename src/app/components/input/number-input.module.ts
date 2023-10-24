import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberInputComponent } from './number-input.component';



@NgModule({
  declarations: [
    NumberInputComponent
  ],
  exports: [
    NumberInputComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NumberInputModule { }
