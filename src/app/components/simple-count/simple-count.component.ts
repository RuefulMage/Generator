import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {GeneratorService} from "../../services/generator.service";
import {generate} from "rxjs";

@Component({
  selector: 'app-simple-count',
  templateUrl: './simple-count.component.html',
  styleUrls: ['./simple-count.component.css']
})
export class SimpleCountComponent implements OnInit {
  myForm = new FormGroup({
    rows: new FormControl(),
    digits: new FormControl(),
  });

  currentRows: string[][] = [];
  answers: string[] = [];

  constructor(private generator: GeneratorService) { }

  onSubmit() {
    this.currentRows = [];
    this.answers = [];

    if (this.myForm.get('rows')?.value && this.myForm.get('rows')?.value) {
      for (let i = 0; i < 10; i++ ) {
        const {result, answer} = this.generator.generateExample(this.myForm.get('rows')?.value, this.myForm.get('digits')?.value);
        this.currentRows.push(result.map(({example, sign}) => {
          return `${sign === 'negative' ? '-' : ''}${example}`;
        }));
        this.answers.push(answer);
      }
    }
  }

  ngOnInit(): void {
  }


}
