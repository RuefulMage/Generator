import {Component, OnInit} from '@angular/core';
import {GeneratorService} from "./services/generator.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'generator';

  constructor(private generator: GeneratorService) {
  }
  ngOnInit() {
  }
}
