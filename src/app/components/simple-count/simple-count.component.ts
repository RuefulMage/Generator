import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AlternationMode, GeneratorService} from "../../services/generator.service";
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
    alternation: new FormControl('no'),
    positivePossibleDigits: new FormControl([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    negativePossibleDigits: new FormControl([-1, -2, -3, -4, -5, -6, -7, -8, -9])
  });

  currentRows: string[][] = [];
  currentAnswers: string[][] = [];
  answers: string[] = [];

  constructor(private generator: GeneratorService) {
  }

  onSubmit() {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];

    if (this.myForm.get('rows')?.value && this.myForm.get('rows')?.value) {
      const possibleDigits = [...(this.myForm.get('positivePossibleDigits')?.value as Array<number>),
        ...(this.myForm.get('negativePossibleDigits')?.value as Array<number>)
      ];

      for (let i = 0; i < 10; i++) {
        const rows = this.generator.generate(
          this.myForm.get('rows')?.value,
          this.myForm.get('digits')?.value,
          this.myForm.get('alternation')?.value as AlternationMode,
          possibleDigits
        );
        const currentExampleRows: string[] = [];
        const currentExampleAnswers: string[] = [];
        rows.forEach(({sign, digits, answers}) => {
          currentExampleRows.push(`${sign === 'negative' ? '-' : ''}${digits.reduce((accumulator, current) => accumulator += Math.abs(current).toString(), '')}`);
          currentExampleAnswers.push(answers.reduce((accumulator, current) => accumulator += Math.abs(current).toString(), ''));
        });
        this.currentRows.push(currentExampleRows.map(value => parseInt(value).toString()));
        this.currentAnswers.push(currentExampleAnswers);
        this.answers.push(currentExampleAnswers[currentExampleAnswers.length - 1]);
      }
    }
  }

  ngOnInit(): void {
  }


}
