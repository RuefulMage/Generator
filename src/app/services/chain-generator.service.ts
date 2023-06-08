import {Injectable} from '@angular/core';
import {GeneratorService2, IExample, IExampleGeneratorParams, IRow, Mode} from "./generator-2.service";
import {findIntersectionForTwoDimensionArray, getRandomFromList} from "../utils/utils";

// Используется для создания цепочки примеров, где каждый новый пример учитывает особенности предыдущих
@Injectable({
  providedIn: 'root'
})
export class ChainGeneratorService {

  examples: IExample[] = [];
  params: IExampleGeneratorParams | null = null;
  usedCombinations: number[][] = [];
  usedColumns: number[][] = [];
  priorityDigits: number[] = [];
  priorityDigitsCombinations: number[][] = [];
  currentPriorityDigitCombinationIndex = 0;

  constructor(
    private generator: GeneratorService2
  ) {
  }

  setParamsForGenerator(params: IExampleGeneratorParams): void {
    this.reset();

    this.params = params;
    if (params.possibleDigits.brothers.length > 4 ) {
      this.priorityDigits = [...params.possibleDigits.brothers];
    } else {
      this.priorityDigitsCombinations = [...this.generateCombinationByRangeLength(
        params.possibleDigits.brothers, params.possibleDigits.brothers.length
      )];
      console.log(this.priorityDigitsCombinations);
    }
  }

  getExample(): IExample | undefined {
    if (!this.params) {
      console.error('Отсутствуют настройки для генератора');
      return;
    }

    let example: IExample;
    if (this.params.possibleDigits.brothers.length > 4) {
      example = this.generator.generate(this.params,
        [...this.usedCombinations],
        [...this.usedColumns],
        [...this.priorityDigits]
      );
    } else {
      example = this.generator.generate(this.params,
        [...this.usedCombinations],
        [...this.usedColumns],
        [...this.priorityDigitsCombinations[this.currentPriorityDigitCombinationIndex]]
      );
      if( this.currentPriorityDigitCombinationIndex === this.priorityDigitsCombinations.length - 1) {
        this.currentPriorityDigitCombinationIndex = 0;
      } else {
        this.currentPriorityDigitCombinationIndex +=1;
      }
    }

    this.filterPriorityDigitsAndCombinationsByExample(example, this.params);

    this.examples.push(example);

    this.addExampleToColumns(example);

    return example;
  }

  private filterPriorityDigitsAndCombinationsByExample(example: IExample, params: IExampleGeneratorParams) {
    const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, example.usedCombinations);
    if (intersection.length === example.usedCombinations.length) {
      this.usedCombinations = [];
    }
    this.usedCombinations.push(...example.usedCombinations);

    if (params.possibleDigits.brothers.length > 4) {
      this.filterPriorityDigits(params);
    }
  }

  private filterPriorityDigits(params: IExampleGeneratorParams) {
    const usedFormulas: Set<number> = new Set(this.usedCombinations.map(value => value[1]));
    if (this.priorityDigits.length <= usedFormulas.size) {

    } else {
      this.priorityDigits = this.priorityDigits.filter(digit => !this.usedCombinations.find(value => value[1] === digit));
    }

    if (this.priorityDigits.length === 0) {
      this.priorityDigits = [...params.possibleDigits.brothers];
    }
  }

  private addExampleToColumns(example: IExample) {
    const startIndex = this.usedColumns.length - 1;

    for (let i = 0; i < example.example.length; i++) {
      const currentDigits = example.example[i].digits;

      currentDigits.forEach((value, digitIndex) => {
        if (i === 0) {
          this.usedColumns.push([value]);
        } else {
          const index = startIndex + digitIndex + 1;
          this.usedColumns[index].push(value);
        }
      })
    }
  }

  private reset(): void {
    this.examples = [];
    this.params = null;
    this.usedCombinations = [];
  }

  private getCombinations(digits: number[], length: number): number[][] {
    const result: number[][] = [];

    function generateCombination(combination: number[], index: number): void {
      if (combination.length === length) {
        result.push(combination);
        return;
      }

      for (let i = index; i < digits.length; i++) {
        generateCombination([...combination, digits[i]], i + 1);
      }
    }

    generateCombination([], 0);

    return result;
  }

  private generateCombinationByRangeLength(digits: number[], length: number): number[][] {
    const combinations = [];
    for (let i = 1; i <= digits.length; i++) {
      combinations.push(...this.getCombinations(digits, i));
    }

    return combinations;
  }
}
