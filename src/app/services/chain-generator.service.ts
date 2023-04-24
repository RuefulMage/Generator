import {Injectable} from '@angular/core';
import {GeneratorService2, IExample, IExampleGeneratorParams, IRow, Mode} from "./generator-2.service";
import {findIntersectionForTwoDimensionArray} from "../utils/utils";


@Injectable({
  providedIn: 'root'
})
export class ChainGeneratorService {

  examples: IExample[] = [];
  params: IExampleGeneratorParams | null = null;
  usedCombinations: number[][] = [];

  constructor(
    private generator: GeneratorService2
  ) {
  }

  setParamsForGenerator(params: IExampleGeneratorParams): void {
    this.reset();

    this.params = params;
  }

  getExample(): IExample | undefined {
    if (!this.params) {
      console.error('Отсутсвуют настройки для генератора');
      return;
    }

    const example = this.generator.generate(this.params, [...this.usedCombinations]);

    const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, example.usedCombinations);
    if (intersection.length === example.usedCombinations.length) {
      this.usedCombinations = [];
    }
    this.usedCombinations.push(...example.usedCombinations);

    this.examples.push(example);

    return example;
  }

  private reset(): void {
    this.examples = [];
    this.params = null;
    this.usedCombinations = [];
  }
}
