import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamplesComponent } from './examples.component';



@NgModule({
  declarations: [
    ExamplesComponent
  ],
  exports: [
    ExamplesComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ExamplesModule { }
