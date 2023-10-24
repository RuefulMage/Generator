import {Injectable} from '@angular/core';
import {ChainGeneratorService} from "./chain-generator.service";
import {ISettings} from "../types/settings";
import {AlternationMode, Mode} from "./generator.service";

@Injectable({
  providedIn: 'root'
})
export class MainGeneratorService {
  currentRows: string[][] = [];
  currentAnswers: string[][] = [];
  answers: string[] = [];
  usedFormulas: number[][] = [];

  table: Map<Mode, Map<number, number[]>> = new Map();


  constructor(
    private chainGenerator: ChainGeneratorService
  ) {
  }

  getSelectedModes(settings: ISettings): Mode[] {
    const modes: Mode[] = [];

    if (settings.isSimpleMode) {
      modes.push('simple');
    }

    if (settings.isBrothersMode) {
      modes.push('brothers');
    }

    return modes;
  }

  generate(settings: ISettings) {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];
    const {
      rows,
      digits,
      positiveSimplePossibleDigits,
      negativeSimplePossibleDigits,
      negativeBrothersPossibleDigits,
      positiveBrothersPossibleDigits,
      alternation
    } = settings;

    if (rows && digits) {
      const possibleSimpleDigits = [...positiveSimplePossibleDigits, ...negativeSimplePossibleDigits];
      const possibleBrothersDigits = [...positiveBrothersPossibleDigits, ...negativeBrothersPossibleDigits];
      const possibleBrothersDigitsStrengthened: number[] = [];

      this.generateExample({
        rows,
        columns: digits,
        possibleBrothers: possibleBrothersDigits,
        possibleBrothersDigitsStrengthened,
        possibleSimple: possibleSimpleDigits,
        possibleModes: this.getSelectedModes(settings),
        alternationMode: alternation
      });
    }
  }


  generateExample(props: {
    rows: number,
    columns: number,
    possibleBrothers: number[],
    possibleBrothersDigitsStrengthened: number[],
    possibleSimple: number[],
    possibleModes: Mode[],
    alternationMode: string
  }): void {
    this.currentRows = [];
    this.currentAnswers = [];
    this.answers = [];
    this.usedFormulas = [];

    const possibleSimple: number[] = props.possibleSimple || [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const possibleModes: Mode[] = props.possibleModes || ['simple'];

    this.chainGenerator.setParamsForGenerator({
      rowsAmount: props.rows,
      digits: props.columns,
      alternationMode: props.alternationMode as AlternationMode,
      possibleDigits: {
        simple: possibleSimple,
        brothers: props.possibleBrothers || []
      },
      possibleBrothersDigitsStrengthened: props.possibleBrothersDigitsStrengthened || [],
      possibleModes,
      isLimitedIntermediateAnswer: false,
      isAllDischarge: false
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
}
