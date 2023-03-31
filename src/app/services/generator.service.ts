import {Injectable} from '@angular/core';
import {
  addFiveBasedNumbers,
  compareFiveBasedNumbers,
  convertFiveToDecimal,
  getArrayDifference,
  getArrayModulesDifference,
  getLastDigitInFiveBasedSystem,
  getNumberOfDigitsInFiveBasedSystem,
  getRandomFive,
  getRandomFromList,
  isNegative
} from "../utils/utils";

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  currentMode = 'simple';

  constructor() {
  }

  public generateExample(rows: number, digits: number): { result: { example: string; sign: 'positive' | 'negative' }[], answer: string } {
    const example: { example: number[]; answer: number }[] = [];
    const result: { example: string; sign: 'positive' | 'negative' }[] = [];

    for (let i = 0; i < rows - 1; i++) {
      let candidates = [];
      const positiveCandidates = [];
      const negativeCandidates = [];

      for (let j = 0; j < digits; j++) {
        if (i === 0) {
          const firstNumber = parseInt(getRandomFive(1, 14));
          example.push({example: [firstNumber], answer: firstNumber});

          if (j === 0) {
            result.push({example: convertFiveToDecimal(Math.abs(firstNumber).toString()).toString(), sign: 'positive'})
          } else {
            result[i].example += convertFiveToDecimal(Math.abs(firstNumber).toString()).toString();
          }
        }
        const digitCandidates = this.generatePossibleValuesList(example[j].answer, example[j].example);
        candidates.push(digitCandidates);
        positiveCandidates.push(digitCandidates.filter(a => a >= 0));
        negativeCandidates.push(digitCandidates.filter(a => a < 0));
      }

      let sign: 'positive' | 'negative' = getRandomFromList(['positive', 'negative']);

      if (i > 1 && result[i - 1].sign === result[i - 2].sign) {
        sign = result[i - 1].sign === 'positive' ? 'negative' : 'positive';
      }

      const isEveryDigitHasPositive = positiveCandidates.every(item => item.length > 0);
      const isEveryDigitHasNegative = negativeCandidates.every(item => item.length > 0);

      if (sign === 'positive') {
        if (isEveryDigitHasPositive) {
          candidates = positiveCandidates;
        } else if (isEveryDigitHasNegative) {
          sign = 'negative';
          candidates = negativeCandidates;
        } else {
          candidates = positiveCandidates.map(value => {
            if (value.length < 1) {
              return [0];
            }

            return value;
          });
        }
      } else {

        if (isEveryDigitHasNegative) {
          candidates = negativeCandidates;
        } else if (isEveryDigitHasPositive) {
          sign = 'positive';
          candidates = positiveCandidates;
        } else {
          candidates = negativeCandidates.map(value => {
            if (value.length < 1) {
              return [0];
            }

            return value;
          });
        }
      }

      for (let k = 0; k < digits; k++) {
        const chosenCandidate = getRandomFromList(candidates[k]);
        example[k].answer = addFiveBasedNumbers(example[k].answer, chosenCandidate);
        example[k].example.push(chosenCandidate);
        if (k === 0) {
          result.push({example: convertFiveToDecimal(Math.abs(chosenCandidate).toString()).toString(), sign})
        } else {
          result[i + 1].example += convertFiveToDecimal(Math.abs(chosenCandidate).toString()).toString();
        }
      }

    }

    return {
      result,
      answer: example
        .reduce((accumulator, currentValue) => accumulator += convertFiveToDecimal(currentValue.answer.toString()).toString(), '')
    };
  }

  private generateOneDigitRow(rows: number) {
    const currentExample: number[] = [];

    const firstNumber = parseInt(getRandomFive(0, 20));
    currentExample.push(firstNumber);
    let answer = firstNumber;

    for (let i = 0; i < rows; i++) {
      const candidates = this.generatePossibleValuesList(answer, currentExample);
      const chosenCandidate = getRandomFromList(candidates);
      answer = addFiveBasedNumbers(answer, chosenCandidate);
      currentExample.push(chosenCandidate);
    }

    return {
      example: currentExample.map(a => convertFiveToDecimal(a.toString())),
      answer: convertFiveToDecimal(answer.toString())
    };
  }

  reset(): void {

  }

  private generatePossibleValuesList(base: number, currentExample: number[]): number[] {
    const result = [];
    let currentResult = base;
    let currentNumber = -20;

    while (compareFiveBasedNumbers(currentNumber, 20) === -1) {
      if (this.isValidForSimpleCount(currentNumber, currentResult)) {
        result.push(currentNumber);
      }

      currentNumber = addFiveBasedNumbers(currentNumber, 1);
    }

    if (result.length < 1) {
      debugger;
      console.error(`result for base: ${base} is empty`);
      throw new Error();
    }

    const newNumbers = getArrayModulesDifference(result, currentExample);

    if (newNumbers.length > 0) {
      return newNumbers;
    }

    const resultWithoutLastExamples = getArrayModulesDifference(result, currentExample.slice(currentExample.length - 3));

    if (resultWithoutLastExamples.length > 0) {
      return resultWithoutLastExamples;
    }

    const resultWithoutBase = result.filter(a => a !== Math.abs(base));
    if (resultWithoutBase.length > 0) {
      return resultWithoutBase;
    }

    return result;
  }

  private isValidForSimpleCount(candidate: number, currentResult: number): boolean {
    if (candidate === 0) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(currentResult, candidate), 0) === -1) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(currentResult, candidate), 20) !== -1) {
      return false;
    }

    if (getNumberOfDigitsInFiveBasedSystem(currentResult) > 1
      && getNumberOfDigitsInFiveBasedSystem(candidate) === 1
      && (addFiveBasedNumbers(getLastDigitInFiveBasedSystem(currentResult), candidate) < 0
        || addFiveBasedNumbers(getLastDigitInFiveBasedSystem(currentResult), candidate) > 4)) {
      return false;
    }

    if (
      getNumberOfDigitsInFiveBasedSystem(currentResult) === 1
      && getNumberOfDigitsInFiveBasedSystem(candidate) === 1
      && getNumberOfDigitsInFiveBasedSystem(addFiveBasedNumbers(currentResult, candidate)) > 1
    ) {
      return false;
    }

    return true;
  }
}
