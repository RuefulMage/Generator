import {Injectable} from '@angular/core';
import {
  addFiveBasedNumbers,
  compareFiveBasedNumbers, convertDecimalToFive,
  convertFiveToDecimal,
  getArrayModulesDifference,
  getLastDigitInFiveBasedSystem,
  getNumberOfDigitsInFiveBasedSystem, getNumbersRange,
  getRandomFromList,
} from "../utils/utils";

export type Sign = 'positive' | 'negative';

export type AlternationMode = 'no' | 'on' | 'double' | 'multiple';

interface IRow {
  digits: number[];
  answers: number[];
  sign: Sign;
}

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  currentMode = 'simple';

  constructor() {
  }

  public convertExampleToDecimal(rows: IRow[]): IRow[] {
    const convertedRows: IRow[] = [];

    rows.forEach(({digits, sign, answers}) => {
      const row: IRow = {
        digits: digits.map(digit => convertFiveToDecimal(digit)),
        answers: answers.map(answer => convertFiveToDecimal(answer)),
        sign
      };

      convertedRows.push(row);
    });

    return convertedRows;
  }

  public generate(rowsAmount: number,
                  digits: number,
                  alternationMode: AlternationMode = 'no',
                  possibleDigits: number[]
  ): IRow[] {
    const rows: IRow[] = [];
    const convertedPossibleDigits = possibleDigits.filter(digit => digit.toString() !== '-').map(digit => convertDecimalToFive(digit));

    for (let rowIndex = 0; rowIndex < rowsAmount; rowIndex++) {
      const currentDigits = this.getDigitsAmountByAlternationMode(alternationMode, rowIndex, digits);
      rows.push(this.generateOneRow(currentDigits, rows, digits, convertedPossibleDigits));
    }

    return this.convertExampleToDecimal(rows);
  }

  private generateOneRow(digits: number, rows: IRow[], maxDigitsNumber: number, possibleDigits: number[], possibleAnswers: number[] = []): IRow {
    const row: IRow = {
      digits: [],
      answers: [],
      sign: 'positive'
    };
    const positiveCandidates: number[][] = [];
    const negativeCandidates: number[][] = [];
    let candidates: number[][] = [];
    let allCandidates: number[][] = [];
    for (let digitIndex = 0; digitIndex < maxDigitsNumber; digitIndex++) {
      if (rows.length === 0) {
        const firstNumber = this.getFirstNumber(possibleDigits);
        row.digits.push(firstNumber);
        row.answers.push(firstNumber);
        row.sign = 'positive';
      } else {
        if (digitIndex < maxDigitsNumber - digits) {
          candidates.push([0]);
          positiveCandidates.push([0]);
          negativeCandidates.push([0]);
          allCandidates.push([0]);
        } else {
          const possibleValues = this.generatePossibleValuesList(
            rows[rows.length - 1].answers[digitIndex],
            rows.map(row => row.digits[digitIndex]),
            this.getPossibleDigitsByCurrentAnswer(possibleDigits),
            possibleAnswers || [],
            this.isNeedZeroing(possibleDigits, rows[rows.length - 1].answers),
            this.isNeedMaximize(possibleDigits, rows[rows.length - 1].answers));
          allCandidates.push(possibleValues[0]);
          candidates.push(possibleValues[1]);
          positiveCandidates.push(candidates[digitIndex].filter(cand => cand > 0));
          negativeCandidates.push(candidates[digitIndex].filter(cand => cand < 0));
        }
      }
    }

    if (rows.length === 0) {
      return row;
    }

    return this.getRowByCandidates(rows, allCandidates, candidates, positiveCandidates, negativeCandidates, digits);
  }


  private isNeedZeroing(possibleDigits: number[], currentAnswers: number[]): boolean {
    if (!possibleDigits.some(digit => digit < 0)) {
      const maxDigit = Math.max(...possibleDigits);
      const maxAnswer = maxDigit > 4 ? 14 : 4;

      return currentAnswers.some(answer => answer === maxAnswer);
    }

    return false;
  }

  private isNeedMaximize(possibleDigits: number[], currentAnswers: number[]): boolean {
    if (!possibleDigits.some(digit => digit > 0)) {
      const minDigit = Math.min(...possibleDigits);
      const minAnswer = 0;

      return currentAnswers.some(answer => answer === minAnswer);
    }

    return false;
  }

  private getFirstNumber(possibleDigits: number[]): number {
    const positivePossibleDigits = possibleDigits.filter(digit => digit > 0);
    const negativePossibleDigits = possibleDigits.filter(digit => digit < 0);
    if (negativePossibleDigits.length === 0) {
      return 0;
    }

    if (positivePossibleDigits.length === 0) {
      const minPossibleDigit = Math.min(...possibleDigits);

      return minPossibleDigit < -4 ? 14 : 4;
    }

    return getRandomFromList(positivePossibleDigits);
  }

  private getDigitsAmountByAlternationMode(mode: AlternationMode, rowIndex: number, digits: number): number {
    let computedDigits = digits;
    switch (mode) {
      case 'no':
        computedDigits = digits;
        break;
      case 'on':
        computedDigits = rowIndex % 2 === 0 ? digits : digits - 1;
        break;
      case 'double':
        if (rowIndex % 3 === 0) {
          computedDigits = digits;
        } else if (rowIndex % 3 === 1) {
          computedDigits = digits - 1;
        } else {
          computedDigits = digits - 2;
        }
        break;
      case 'multiple' :
        const possibleDigitsAmount = getNumbersRange(1, digits);
        computedDigits = getRandomFromList(possibleDigitsAmount);
        break;
      default:
        computedDigits = digits;
    }

    return Math.max(computedDigits, 1);
  }

  private getRowByCandidates(
    rows: IRow[],
    allCandidates: number[][],
    candidates: number[][],
    positiveCandidates: number[][],
    negativeCandidates: number[][],
    digitsInRowAmount: number
  ): IRow {
    const row: IRow = {
      digits: [],
      sign: 'positive',
      answers: []
    };

    const firstDigitNumber = candidates.length - digitsInRowAmount;
    row.sign = this.calculateRowSign(rows,
      positiveCandidates.slice(firstDigitNumber),
      negativeCandidates.slice(firstDigitNumber));
    candidates = row.sign === 'positive' ? positiveCandidates : negativeCandidates;
    candidates.forEach((cands, index) => {
      let choosenCandidate = 0;
      if (cands.length !== 0) {
        choosenCandidate = getRandomFromList(cands);
      }
      // else {
      //   const allSignCandidates = allCandidates[index].filter(cand => {
      //     if (row.sign === 'positive') {
      //       return cand > 0;
      //     } else {
      //       return cand < 0;
      //     }
      //   })
      //
      //   choosenCandidate = getRandomFromList(allSignCandidates.length > 0 ? allSignCandidates : [0]);
      // }

      row.digits.push(choosenCandidate);
      row.answers.push(addFiveBasedNumbers(rows[rows.length - 1].answers[index], choosenCandidate));
    });

    return row;
  }

  private calculateRowSign(rows: IRow[], positiveCandidates: number[][], negativeCandidates: number[][]): Sign {
    if (positiveCandidates[0].length === 0 || negativeCandidates[0].length === 0) {
      return positiveCandidates[0].length === 0 ? 'negative' : 'positive';
    }

    const isEveryDigitHasPositive = positiveCandidates.every(item => item.length > 0);
    const isEveryDigitHasNegative = negativeCandidates.every(item => item.length > 0);

    let prioritySign: Sign = getRandomFromList(['positive', 'negative']);

    if (rows.length > 1 && rows[rows.length - 1].sign === rows[rows.length - 2].sign) {
      prioritySign = rows[rows.length - 1].sign === 'positive' ? 'negative' : 'positive';
    }

    if (isEveryDigitHasPositive && prioritySign === 'positive') {
      return 'positive';
    } else if (isEveryDigitHasNegative && prioritySign === 'negative') {
      return 'negative';
    } else {
      if (prioritySign === 'positive') {
        return isEveryDigitHasNegative ? 'negative' : prioritySign;
      } else {
        return isEveryDigitHasPositive ? 'positive' : prioritySign;
      }
    }


    return 'positive';
  }


  private generatePossibleValuesList(
    base: number,
    currentExample: number[],
    possibleCandidates: number[],
    possibleAnswer: number[] = [],
    isZeroing = false,
    isNeedMaximize = false
  ): [number[], number[]] {
    let result = [];
    let currentResult = base;
    let currentNumber = -20;
    debugger;

    if (isZeroing) {
      result.push(-base);
      return [result, result];
    }

    if (isNeedMaximize) {
      const maxValue = Math.min(...possibleCandidates) < -4 ? 14 : 4;
      const value = addFiveBasedNumbers(-currentResult, maxValue);
      result.push(value);
      return [result, result];
    }

    debugger;
    while (compareFiveBasedNumbers(currentNumber, 20) === -1) {
      if (possibleAnswer.length > 0) {
        if (!possibleAnswer.find(item => item === addFiveBasedNumbers(currentNumber, currentResult))) {
          currentNumber = addFiveBasedNumbers(currentNumber, 1);
          continue;
        }
      }

      if (this.isValidForSimpleCount(currentNumber, currentResult)) {
        result.push(currentNumber);
      }

      currentNumber = addFiveBasedNumbers(currentNumber, 1);
    }

    if (result.length < 1) {
      console.error(`result for base: ${base} is empty`);
      result.push(0);
    }

    result = result.filter(digit => possibleCandidates.find(item => item === digit));

    return [result, this.getUniqueCandidates(result, base, currentExample)];
  }


  private getPossibleDigitsByCurrentAnswer(possibleDigits: number[]): number[] {
    const positivePossibleDigits = possibleDigits.filter(item => item > 0);
    const negativePossibleDigits = possibleDigits.filter(item => item < 0);
    const result = [];

    if (positivePossibleDigits.length === 0) {
      result.push(14);
    }

    if (negativePossibleDigits.length === 0) {
      result.push(-14);
    }

    result.push(...possibleDigits);

    return result;
  }

  private getUniqueCandidates(candidates: number[], base: number, currentExample: number[]): number[] {

    const newNumbers = getArrayModulesDifference(candidates, currentExample);

    if (newNumbers.length > 0) {
      return newNumbers;
    }

    const resultWithoutLastExamples = getArrayModulesDifference(candidates, currentExample.slice(currentExample.length - 3));

    if (resultWithoutLastExamples.length > 0) {
      return resultWithoutLastExamples;
    }

    const resultWithoutBase = candidates.filter(a => a !== Math.abs(base));
    if (resultWithoutBase.length > 0) {
      return resultWithoutBase;
    }


    return candidates;
  }

  private isValidForSimpleCount(candidate: number, currentResult: number): boolean {
    console.log(currentResult);
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
      debugger;
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
