import {Injectable} from '@angular/core';
import {GeneratorService2, IExample, IExampleGeneratorParams, IRow, Mode} from "./generator-2.service";
import {findIntersectionForTwoDimensionArray, getRandomFromList} from "../utils/utils";


@Injectable({
  providedIn: 'root'
})
export class ChainGeneratorService {

  examples: IExample[] = [];
  params: IExampleGeneratorParams | null = null;
  usedCombinations: number[][] = [];
  usedColumns: number[][] = [];
  priorityDigits: number[] = [];

  constructor(
    private generator: GeneratorService2
  ) {
  }

  setParamsForGenerator(params: IExampleGeneratorParams): void {
    this.reset();

    this.params = params;
    this.priorityDigits = [...params.possibleDigits.brothers];
  }

  getExample(): IExample | undefined {
    if (!this.params) {
      console.error('Отсутствуют настройки для генератора');
      return;
    }

    const example = this.generator.generate(this.params,
      [...this.usedCombinations],
      [...this.usedColumns],
      [...this.priorityDigits]
    );

    const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, example.usedCombinations);
    if (intersection.length === example.usedCombinations.length) {
      this.usedCombinations = [];
    }
    this.usedCombinations.push(...example.usedCombinations);

    const usedFormulas: Set<number> = new Set(this.usedCombinations.map(value => value[1]));
    if (this.priorityDigits.length <= usedFormulas.size) {

    } else {
      this.priorityDigits = this.priorityDigits.filter(digit => !this.usedCombinations.find(value => value[1] === digit));
    }

    if (this.priorityDigits.length === 0) {
      this.priorityDigits = [...this.params.possibleDigits.brothers];
    }

    this.examples.push(example);

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

    return example;
  }

  private reset(): void {
    this.examples = [];
    this.params = null;
    this.usedCombinations = [];
  }
}
