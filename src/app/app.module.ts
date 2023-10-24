import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {SimpleCountModule} from "./components/simple-count/simple-count.module";
import {SettingsModule} from "./components/settings/settings.module";
import {MainPageModule} from "./components/main-page/main-page.module";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        SimpleCountModule,
        SettingsModule,
        MainPageModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
