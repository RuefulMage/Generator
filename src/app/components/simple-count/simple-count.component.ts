import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AlternationMode, GeneratorService, Mode} from "../../services/generator.service";
import {GeneratorService2, IProperColumn, PossibleAnswers, PossibleDigits} from "../../services/generator-2.service";
import {convertDecimalToFive, convertFiveToDecimal} from "../../utils/utils";
import {ChainGeneratorService} from "../../services/chain-generator.service";

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
    negativeBrothersPossibleDigits: new FormControl([-1, -2, -3, -4, -5, -6, -7, -8, -9]),
    positiveBrothersPossibleDigitsStrengthened: new FormControl([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    negativeBrothersPossibleDigitsStrengthened: new FormControl([-1, -2, -3, -4, -5, -6, -7, -8, -9]),
    isLimitedIntermediateAnswer: new FormControl(false),
    isAllDischarge: new FormControl(false)
  });

  currentRows: string[][] = [];
  currentAnswers: string[][] = [];
  usedFormulas: number[][] = [];
  answers: string[] = [];

  selectedModes: Set<Mode> = new Set();

  isTestsShown = false;

  testsRows = 5;
  testsColumns = 1;

  table: Map<Mode, Map<number, number[]>> = new Map();

  get tableKeys(): Mode[] {
    return ['brothers'];
    // return Array.from(this.table.keys());
  }

  getTableItemsKeysByMode(mode: Mode): number[] {
    return Array.from(this.table.get(mode)?.keys() || []).map(value => convertFiveToDecimal(value)).filter(value => value > 0);
  }

  getTableItemsByNumber(mode: Mode, number: number): number[] {
    number = convertDecimalToFive(number);

    return Array.from(this.table.get(mode)?.get(number)?.map(value => convertFiveToDecimal(value)) || []);
  }

  constructor(
    private generator: GeneratorService,
    private generator2: GeneratorService2,
    private chainGenerator: ChainGeneratorService
  ) {
  }

  onSubmit() {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];

    if (this.myForm.get('rows')?.value && this.myForm.get('rows')?.value) {
      const possibleSimpleDigits = [...(this.myForm.get('positiveSimplePossibleDigits')?.value as Array<number | '-'>),
        ...(this.myForm.get('negativeSimplePossibleDigits')?.value as Array<number | '-'>)
      ].filter(value => value !== '-') as number[];
      const possibleBrothersDigits = [...(this.myForm.get('positiveBrothersPossibleDigits')?.value as Array<number | '-'>),
        ...(this.myForm.get('negativeBrothersPossibleDigits')?.value as Array<number | '-'>)
      ].filter(value => value !== '-') as number[];
      const possibleBrothersDigitsStrengthened = [...(this.myForm.get('positiveBrothersPossibleDigitsStrengthened')?.value as Array<number | '-'>),
        ...(this.myForm.get('negativeBrothersPossibleDigitsStrengthened')?.value as Array<number | '-'>)
      ].filter(value => value !== '-') as number[];

      this.generateExample({
        rows: parseInt(this.myForm.get('rows')?.value),
        columns: parseInt(this.myForm.get('digits')?.value),
        possibleBrothers: possibleBrothersDigits,
        possibleBrothersDigitsStrengthened,
        possibleSimple: possibleSimpleDigits,
        possibleModes:
          Array.from(this.selectedModes)
      });
    }
  }

  generateExample(props: {
    rows?: number,
    columns?: number,
    possibleBrothers?: number[],
    possibleBrothersDigitsStrengthened?: number[],
    possibleSimple?: number[],
    possibleModes?: Mode[]
  }): void {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];
    this.usedFormulas = [];

    const possibleSimple: number[] = props.possibleSimple || [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const possibleModes: Mode[] = props.possibleModes || ['simple'];

    this.chainGenerator.setParamsForGenerator({
      rowsAmount: props.rows || parseInt(this.testsRows.toString()),
      digits: props.columns || parseInt(this.testsColumns.toString()),
      alternationMode: (this.myForm.get('alternation')?.value || 'no') as AlternationMode,
      possibleDigits: {
        simple: possibleSimple,
        brothers: props.possibleBrothers || []
      },
      possibleBrothersDigitsStrengthened: props.possibleBrothersDigitsStrengthened || [],
      possibleModes,
      isLimitedIntermediateAnswer: false,
      isAllDischarge: this.myForm.get('isisAllDischarge')?.value || false
    });

    for (let i = 0; i < 10; i++) {
      const result = this.chainGenerator.getExample();
      if (!result) {
        return;
      }

      const generatedRows = result.example;
      this.table = result.table;

      const currentExampleRows: string[] = [];
      const currentExampleAnswers: string[] = [];
      generatedRows.forEach(({sign, digits, answers}) => {
        currentExampleRows.push(`${sign === 'negative' ? '-' : ''}${digits.reduce((accumulator, current) => accumulator += Math.abs(current).toString(), '')}`);
        currentExampleAnswers.push(answers.reduce((accumulator, current) => accumulator += Math.abs(current).toString(), ''));
      });
      this.currentRows.push(currentExampleRows.map(value => parseInt(value).toString()));
      this.currentAnswers.push(currentExampleAnswers);
      this.answers.push(currentExampleAnswers[currentExampleAnswers.length - 1]);
      this.usedFormulas.push(result.usedCombinations.map(value => value[1]));
    }
  }

  toggleTests() {
    this.isTestsShown = !this.isTestsShown;
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
