import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleCountComponent } from './simple-count.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    SimpleCountComponent
  ],
  exports: [
    SimpleCountComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SimpleCountModule { }
