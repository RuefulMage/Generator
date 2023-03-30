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

  currentRow: string[] = [];
  answer: string | null = '';

  constructor(private generator: GeneratorService) { }

  onSubmit() {
    if (this.myForm.get('rows')?.value && this.myForm.get('rows')?.value) {
      const {result, answer} = this.generator.generateExample(this.myForm.get('rows')?.value, this.myForm.get('digits')?.value);
      this.currentRow = result.map(({example, sign}) => {
        return `${sign === 'negative' ? '-' : ''}${example}`;
      });
      this.answer = answer;
    }
  }

  ngOnInit(): void {
  }


}
