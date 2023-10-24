import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import {NumberInputModule} from "../input/number-input.module";
import {SelectModule} from "../select/select.module";
import {NumbersSelectModule} from "../numbers-select/numbers-select.module";
import {CheckboxModule} from "../checkbox/checkbox.module";
import {ButtonModule} from "../button/button.module";



@NgModule({
  declarations: [
    SettingsComponent
  ],
  exports: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    NumberInputModule,
    SelectModule,
    NumbersSelectModule,
    CheckboxModule,
    ButtonModule
  ]
})
export class SettingsModule { }
