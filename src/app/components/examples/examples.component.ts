import { Component, OnInit } from '@angular/core';
import {MainGeneratorService} from "../../services/main-generator.service";

@Component({
  selector: 'app-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.css']
})
export class ExamplesComponent {

  constructor(
    public generator: MainGeneratorService
  ) { }

}
