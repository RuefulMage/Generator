import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AlternationMode, GeneratorService, Mode} from "../../services/generator.service";

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
    isSimpleMode: new FormControl(false),
    isBrothersMode: new FormControl(false),
    positiveSimplePossibleDigits: new FormControl([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    negativeSimplePossibleDigits: new FormControl([-1, -2, -3, -4, -5, -6, -7, -8, -9]),
    positiveBrothersPossibleDigits: new FormControl([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    negativeBrothersPossibleDigits: new FormControl([-1, -2, -3, -4, -5, -6, -7, -8, -9])
  });

  currentRows: string[][] = [];
  currentAnswers: string[][] = [];
  answers: string[] = [];

  selectedModes: Set<Mode> = new Set();


  constructor(private generator: GeneratorService) {
  }

  onSubmit() {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];

    if (this.myForm.get('rows')?.value && this.myForm.get('rows')?.value) {
      const possibleSimpleDigits = [...(this.myForm.get('positiveSimplePossibleDigits')?.value as Array<number>),
        ...(this.myForm.get('negativeSimplePossibleDigits')?.value as Array<number>)
      ];
      const possibleBrothersDigits = [...(this.myForm.get('positiveBrothersPossibleDigits')?.value as Array<number>),
        ...(this.myForm.get('negativeBrothersPossibleDigits')?.value as Array<number>)
      ];

      for (let i = 0; i < 10; i++) {
        const rows = this.generator.generate(
          parseInt(this.myForm.get('rows')?.value),
          parseInt(this.myForm.get('digits')?.value),
          this.myForm.get('alternation')?.value as AlternationMode,
          possibleSimpleDigits,
          possibleBrothersDigits,
          Array.from(this.selectedModes)
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
    this.myForm.get('isBrothersMode')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedModes.add('brothers');
      } else {
        this.selectedModes.delete('brothers');
      }
    });
    this.myForm.get('isSimpleMode')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedModes.add('simple');
      } else {
        this.selectedModes.delete('simple');
      }
    })
  }


}
