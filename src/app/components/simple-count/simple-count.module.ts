import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleCountComponent } from './simple-count.component';
import {ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    SimpleCountComponent
  ],
  exports: [
    SimpleCountComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class SimpleCountModule { }
