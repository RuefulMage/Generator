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

export type Mode = 'simple' | 'brothers';

interface IRow {
  digits: number[];
  answers: number[];
  sign: Sign;
}

export type PossibleDigits = {
  [key in Mode]: number[];
};

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  rows: IRow[] = [];
  rowsAmount: number = 1;
  digits: number = 1;
  possibleDigits: PossibleDigits = {brothers: [], simple: []};
  limit: number | null = null;
  isLimitedIntermediateAnswer = false;
  possibleModes: Mode[] = ['simple'];

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

  private generateOneRow(
    digits: number,
    rows: IRow[],
    maxDigitsNumber: number,
    possibleSimpleDigits: number[],
    possibleBrothersDigits: number[],
    possibleModes: Mode[] = ['simple'],
    isLimitedIntermediateAnswer = false
  ): IRow {
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
      const currentMode = getRandomFromList(possibleModes);
      console.log(currentMode);
      const possibleAnswers: number[] = [];
      if (currentMode === 'simple' && isLimitedIntermediateAnswer) {
        debugger;
        possibleAnswers.push(...possibleSimpleDigits);
      }
      const possibleDigits = this.getPossibleValuesByMode(currentMode, possibleSimpleDigits, possibleBrothersDigits);
      const possibleDigitsWithoutUsed = this.getPossibleValuesByMode(currentMode, possibleSimpleDigits, possibleBrothersDigits).filter(digit => !row.digits.includes(digit));
      if (rows.length === 0) {
        if (digitIndex < maxDigitsNumber - digits) {
          row.digits.push(0);
          row.answers.push(0);
          row.sign = 'positive';
        } else {
          const firstNumber = this.getFirstNumber(possibleDigitsWithoutUsed.length > 0 ? possibleDigitsWithoutUsed : possibleDigits);
          row.digits.push(firstNumber);
          row.answers.push(firstNumber);
          row.sign = 'positive';
        }
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
            this.getModeValidationFunction(currentMode),
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

  public generate(rowsAmount: number,
                  digits: number,
                  alternationMode: AlternationMode = 'no',
                  possibleSimpleDigits: number[],
                  possibleBrothersDigits: number[],
                  possibleModes: Mode[] = [],
                  isLimitedIntermediateAnswer = false
  ): IRow[] {
    const rows: IRow[] = [];
    const convertedSimplePossibleDigits = possibleSimpleDigits.filter(digit => digit.toString() !== '-').map(digit => convertDecimalToFive(digit));
    const convertedBrothersPossibleDigits = possibleBrothersDigits.filter(digit => digit.toString() !== '-').map(digit => convertDecimalToFive(digit));

    let usedDigits: number[] = [];

    let currentDigits: number | null = null;
    for (let rowIndex = 0; rowIndex < rowsAmount; rowIndex++) {
      if (rowIndex === 0) {}
      currentDigits = this.getDigitsAmountByAlternationMode(alternationMode, rowIndex, digits, usedDigits, currentDigits);
      if (usedDigits.includes(currentDigits)) {
        usedDigits = [];
      }

      usedDigits.push(currentDigits);

      rows.push(this.generateOneRow(currentDigits, rows, digits, convertedSimplePossibleDigits, convertedBrothersPossibleDigits, possibleModes, isLimitedIntermediateAnswer));
    }

    return this.convertExampleToDecimal(rows);
  }

  private getModeValidationFunction(mode: Mode): (candidate: number, currentResult: number) => boolean {
    switch (mode) {
      case "simple":
        return this.isValidForSimpleCount.bind(this);
      case "brothers":
        return this.isValidForBrothers.bind(this);
      default:
        return this.isValidForSimpleCount.bind(this);
    }
  }

  private getPossibleValuesByMode(mode: Mode, possibleSimpleValues: number[], possibleBrothersValues: number[]): number[] {
    return mode === 'simple' ? possibleSimpleValues : possibleBrothersValues;
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
      possibleDigits.sort();
    }

    if (positivePossibleDigits.length === 0) {
      const minPossibleDigit = Math.min(...possibleDigits);

      return minPossibleDigit < -4 ? 14 : 4;
    }

    return getRandomFromList(positivePossibleDigits);
  }

  private getDigitsAmountByAlternationMode(mode: AlternationMode, rowIndex: number, digits: number, usedDigits: number[], previousDigit: number | null): number {
    let computedDigits = digits;

    switch (mode) {
      case 'no':
        computedDigits = digits;
        break;
      case 'on':
        computedDigits = rowIndex % 2 === 0 ? digits : digits - 1;
        break;
      case 'double':
        if (previousDigit) {
          if (previousDigit === digits) {
            computedDigits = previousDigit - 2;
          } else {
            computedDigits = previousDigit + 1;
          }
        } else {
          computedDigits = getRandomFromList([digits - 2, digits - 1, digits]);
        }
        break;
      case 'multiple' :
        const digitsList = getNumbersRange(1, digits);
        const digitsWithoutUsed = digitsList.filter(dig => !usedDigits.includes(dig));

        const possibleDigitsAmount = digitsWithoutUsed.length > 0 ? digitsWithoutUsed : digitsList;
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

      const candsWithoutUsedInCurrentRow = cands.filter(cand => !row.digits.includes(cand));
      if (candsWithoutUsedInCurrentRow.length > 0) {
        debugger;
        choosenCandidate = getRandomFromList(candsWithoutUsedInCurrentRow);
      } else if (cands.length !== 0) {
        choosenCandidate = getRandomFromList(cands);
      } else {
        const allSignCandidates = allCandidates[index].filter(cand => {
          if (row.sign === 'positive') {
            return cand > 0;
          } else {
            return cand < 0;
          }
        })

        const allSignCandidatesWithoutUsedInCurrentRow = allSignCandidates.filter(cand => !row.digits.includes(cand));
        if (allSignCandidatesWithoutUsedInCurrentRow.length > 0) {
          choosenCandidate = getRandomFromList(allSignCandidatesWithoutUsedInCurrentRow);
        } else {
          choosenCandidate = getRandomFromList(allSignCandidates.length > 0 ? allSignCandidates : [0]);
        }
      }

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
    modeValidationFunction: (candidate: number, currentResult: number) => boolean,
    isZeroing = false,
    isNeedMaximize = false
  ): [number[], number[]] {
    console.log(possibleAnswer);
    let result = [];
    let currentResult = base;
    let currentNumber = -20;

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

    while (compareFiveBasedNumbers(currentNumber, 20) === -1) {
      if (possibleAnswer.length > 0) {
        if (!possibleAnswer.find(item => item === addFiveBasedNumbers(currentNumber, currentResult))) {
          currentNumber = addFiveBasedNumbers(currentNumber, 1);
          continue;
        }
      }

      if (modeValidationFunction(currentNumber, currentResult)) {
        result.push(currentNumber);
      }

      currentNumber = addFiveBasedNumbers(currentNumber, 1);
    }

    if (result.length < 1) {
      console.error(`result for base: ${base} is empty`);
      result.push(0);
      if (possibleCandidates.includes(-base)) {
        result.push(-base);
      }
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

  private isValidForBrothers(candidate: number, currentResult: number): boolean {
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
      && (addFiveBasedNumbers(getLastDigitInFiveBasedSystem(currentResult), candidate) >= 0
        || addFiveBasedNumbers(getLastDigitInFiveBasedSystem(currentResult), candidate) > 4)) {
      return false;
    }

    if (
      getNumberOfDigitsInFiveBasedSystem(currentResult) === 1
      && getNumberOfDigitsInFiveBasedSystem(candidate) === 1
      && getNumberOfDigitsInFiveBasedSystem(addFiveBasedNumbers(currentResult, candidate)) === 1
    ) {
      return false;
    }

    return true;

  }
}
