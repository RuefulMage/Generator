import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page.component';
import {SettingsModule} from "../settings/settings.module";
import {ExamplesModule} from "../examples/examples.module";



@NgModule({
  declarations: [
    MainPageComponent
  ],
  exports: [
    MainPageComponent
  ],
  imports: [
    CommonModule,
    SettingsModule,
    ExamplesModule
  ]
})
export class MainPageModule { }
