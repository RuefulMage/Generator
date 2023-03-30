import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {SimpleCountModule} from "./components/simple-count/simple-count.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SimpleCountModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
