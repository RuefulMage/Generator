import {Injectable} from '@angular/core';
import {
  addFiveBasedNumbers,
  compareFiveBasedNumbers, convertDecimalToFive,
  convertFiveToDecimal, findIntersectionForTwoDimensionArray,
  getArrayModulesDifference,
  getLastDigitInFiveBasedSystem,
  getNumberOfDigitsInFiveBasedSystem, getNumbersRange,
  getRandomFromList,
} from "../utils/utils";

export type Sign = 'positive' | 'negative';

// no - нет чередования
// on - каждый пример чередуется с предыдущим по кол-ву цифр в ряду. Например, 4-3-4-3-4 при выбранном кол-ве цифр - 4
// double - цикл чередования равен трем рядам. Например, 4-3-2-4-3-2-4 при выбранном кол-ве цифр - 4
// multiple - в каждом ряду рандомно выбирается кол-во цифр от 1 до выбранного. Например, 4-1-2-4-4-3-1 при выбранном кол-ве цифр - 4
// каждое чередование не обязательно начинается с выбранного кол-ва цифр
export type AlternationMode = 'no' | 'on' | 'double' | 'multiple';

export type Mode = 'simple' | 'brothers';

export interface IRow {
  digits: number[]; // хранит числа столбца
  answers: number[]; // хранит все промежуточные и финальный ответы
  sign: Sign;
}

export type PossibleDigits = {
  [key in Mode]: number[];
};

export type PossibleAnswers = {
  [key in Mode]: number[];
};

export interface IExampleGeneratorParams {
  rowsAmount: number; // кол-во рядов
  digits: number; // кол-во цифр
  alternationMode: AlternationMode; // чередование
  possibleDigits: PossibleDigits; // выбранные числа, которые могут использоваться в примере
  possibleModes: Mode[]; // режим примера - простой счет или братья
  isLimitedIntermediateAnswer?: boolean; // определяет, может ли промежуточный ответ быть вне списка выбранных цифр
  possibleAnswers?: PossibleAnswers; // список возможных цифр промежуточном и финальном ответах
  isAllDischarge?: boolean; // если выбрано, то формулы на всех разрядах кроме старшего
  possibleBrothersDigitsStrengthened?: number[] //содержит цифры, выбранные для усиления в братьях
}

// Является объектом, который хранит ряд, содержащий как минимум одну формулу братьев
export interface IProperColumn {
  values: number[];
  brothersNumberCount: number;
  uniqueNumberAmount: number;
  isSelected: boolean;
  combinationsForBrothers: number[][];
}

export interface IExample {
  example: IRow[];
  table: Map<Mode, Map<number, number[]>>;
  usedCombinations: number[][];
}

@Injectable({
  providedIn: 'root'
})
export class GeneratorService2 {

  rows: IRow[] = [];
  maxRowsAmount: number = 1;
  digits: number = 1;
  usedDigits: number[] = [];
  possibleDigits: PossibleDigits = {brothers: [], simple: []};
  possibleAnswers: PossibleAnswers = {brothers: [], simple: []};
  limit: number | null = null;
  isLimitedIntermediateAnswer = false;
  possibleModes: Mode[] = ['simple'];
  alternationMode: AlternationMode = 'no';
  usedCombinations: number[][] = [];
  excludedColumns: number[][] = [];
  priorityDigits: number[] = [];
  strengthenedDigits: number[] = [];
  isAllDischarge = false;

  // в качестве ключа тут длина хранимых в значении столбцов
  properRows: Map<number, IProperColumn[]> = new Map();

  properSimpleRows: Map<number, IProperColumn[]> = new Map();

  possibleValuesTables: Map<Mode, Map<number, number[]>> = new Map();

  columnsLength: number[] = [];

  rowsLengths: number[] = [];

  lastColumn: IProperColumn | null = null;

  selectedColumns: IProperColumn[] = [];

  constructor() {
  }

  public generate(params: IExampleGeneratorParams,
                  usedCombinations: number[][] = [],
                  excludedColumns: number[][] = [],
                  priorityDigits: number[] = [],
                  strengthenedDigits: number[] = []
  ): IExample {
    this.reset();
    this.excludedColumns = excludedColumns;
    this.priorityDigits = priorityDigits;
    this.strengthenedDigits = strengthenedDigits;

    this.usedCombinations = usedCombinations;
    const {
      rowsAmount,
      digits,
      alternationMode,
      possibleDigits,
      possibleModes,
      isLimitedIntermediateAnswer,
      possibleAnswers,
      isAllDischarge
    } = params;

    if (possibleDigits.simple.filter(value => value > 0).length === 0) {
      possibleDigits.simple.push(-Math.min(...possibleDigits.simple));
    } else if (possibleDigits.simple.filter(value => value < 0).length === 0) {
      possibleDigits.simple.push(-Math.max(...possibleDigits.simple));
    }

    this.maxRowsAmount = rowsAmount;
    this.digits = digits;
    this.alternationMode = alternationMode;
    this.possibleDigits = {
      simple: possibleDigits.simple.map(digit => convertDecimalToFive(digit)),
      brothers: possibleDigits.brothers.map(digit => convertDecimalToFive(digit))
    };
    this.possibleAnswers = {
      simple: possibleAnswers?.simple?.map(digit => convertDecimalToFive(digit)) || [],
      brothers: possibleAnswers?.brothers?.map(digit => convertDecimalToFive(digit)) || []
    };
    this.possibleModes = possibleModes;
    this.isLimitedIntermediateAnswer = isLimitedIntermediateAnswer || false;
    this.isAllDischarge = !!(this.digits > 1 && isAllDischarge);

    this.generatePossibleValuesTables();

    const example = this.generateExample();

    return {example, table: this.possibleValuesTables, usedCombinations: this.usedCombinations};
  }

  private generateExample(): IRow[] {
    this.generateRowsLengths();
    this.generateColumnsLengths();

    if (this.maxRowsAmount < 11) {
      let i = 1;
      while (compareFiveBasedNumbers(i, 20) === -1) {
        this.getAllProperColumns(1, [i], i);
        i = addFiveBasedNumbers(i, 1);
      }

      // Столбцы сортируются по кол-ву использованных формул братьев, а потом по кол-ву уникальных чисел
      this.properRows.forEach((value, key) => {
        this.properRows.set(key, value.sort((value1, value2) => {
          if (value1.brothersNumberCount < value2.brothersNumberCount) {
            return 1;
          } else if (value1.brothersNumberCount > value2.brothersNumberCount) {
            return -1;
          } else {
            if (value1.uniqueNumberAmount < value2.uniqueNumberAmount) {
              return 1;
            } else if (value1.uniqueNumberAmount > value2.uniqueNumberAmount) {
              return -1;
            } else {
              return 0;
            }
          }
        }));
      });

      let filteredColumns = this.filterColumnsBySameSignAtSameIndexes();

      // Есть вероятность, что невозможно набрать нужное кол-во столбцов с выбранными длинами столбцов
      while (filteredColumns.size === 0) {
        if (filteredColumns.size === 0) {
          console.error('No columns combinations for this rows and columns lengths');
        }

        this.generateRowsLengths();
        this.generateColumnsLengths();
        filteredColumns = this.filterColumnsBySameSignAtSameIndexes();
      }

      this.selectedColumns = this.selectFromColumns(filteredColumns);
      this.fillRowsByColumns(this.selectedColumns);

      this.usedCombinations = [];
      this.selectedColumns.forEach(({combinationsForBrothers}) => this.usedCombinations.push(...combinationsForBrothers));

      this.convertRowsToDecimal();
    } else {
      for (let rowIndex = 0; rowIndex < this.maxRowsAmount; rowIndex++) {
        const currentDigitsAmount = this.getDigitsAmountByAlternationMode();
      }
    }

    return this.rows;
  }

  // Из выбранных столбцов формируются строки нужных длин
  private fillRowsByColumns(columns: IProperColumn[]): void {
    this.rowsLengths.forEach((rowLength, rowIndex) => {
      const row: IRow = {digits: [], answers: [], sign: 'positive'};
      const prevRow = this.rows[this.rows.length - 1];

      this.columnsLength.forEach((columnLength, columnsIndex) => {
        const isZero = columnsIndex < this.digits - rowLength;

        if (isZero) {
          row.digits.push(0);
          row.answers.push(prevRow?.answers[columnsIndex] || 0);
        } else {
          const indexAtColumns = this.rows.filter(({digits}) => digits[columnsIndex] !== 0).length;
          const currentDigit = columns[columnsIndex]?.values[indexAtColumns];

          row.digits.push(currentDigit);
          row.answers.push(prevRow ? addFiveBasedNumbers(prevRow.answers[columnsIndex], currentDigit) : currentDigit);

          if (currentDigit > 0) {
            row.sign = 'positive';
          } else {
            row.sign = 'negative';
          }

        }
      });

      this.rows.push(row);
    });
  }

  private convertRowsToDecimal(): void {
    this.rows = this.rows.map(row => ({
      sign: row.sign,
      answers: row.answers.map(answer => convertFiveToDecimal(answer)),
      digits: row.digits.map(digit => convertFiveToDecimal(digit)),
    }));
  }

  private getArraysDifference(first: number[][], second: number[][]): number[][] {
    return first.filter(
      firstSubarr => !second.some(
        secondArrElem => secondArrElem.every(
          (val, i) => val === firstSubarr[i]
        )
      )
    );
  }

  private selectFromColumns(columns: Map<number, IProperColumn[]>): IProperColumn[] {
    if (this.lastColumn) {
      this.usedCombinations.push(...this.lastColumn?.combinationsForBrothers);
    }

    const selected: IProperColumn[] = [];
    return this.columnsLength.map((length, index) => {

      if (index === this.digits - 1 && this.lastColumn) {
        return this.lastColumn;
      }

      let shuffledColumns = columns.get(length) ? this.shuffleArray(this.shuffleArray(columns.get(length)!)) : [];

      let columnsForCurrentLength = [];

      if (this.strengthenedDigits.length > 0) {
        columnsForCurrentLength = this.filterColumnsWithStrengthened(shuffledColumns);
      } else {
        columnsForCurrentLength = this.filterColumns(shuffledColumns);
      }

      const filteredByAnswer = this.filterColumnsByGeneralAnswers(columnsForCurrentLength, this.lastColumn ? [...selected, this.lastColumn] : []);

      if (filteredByAnswer.length > 0) {
        columnsForCurrentLength = filteredByAnswer;
      }

      if (columnsForCurrentLength.length !== 0) {
        const selectedColumns = getRandomFromList(this.shuffleArray(this.shuffleArray(columnsForCurrentLength)));

        selectedColumns.isSelected = true;
        this.usedCombinations.push(...selectedColumns.combinationsForBrothers);
        selected.push(selectedColumns);

        return selectedColumns;
      }

      return {
        values: [],
        brothersNumberCount: 0,
        uniqueNumberAmount: 0,
        isSelected: false,
        combinationsForBrothers: []
      };
    });
  }

  private filterColumns(shuffledColumns: IProperColumn[]): IProperColumn[] {
    let columnsForCurrentLength = shuffledColumns
      ?.filter(({isSelected, combinationsForBrothers, values}) => {
        const isPriority = this.priorityDigits.every(digit => combinationsForBrothers.find(values => values[1] === digit));
        const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
        const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

        return intersection.length === 0 && !isSelected && !isColumnUsed && isPriority;
      }) || [];

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers, values}) => {
          const isPriority = this.priorityDigits.some(digit => combinationsForBrothers.find(values => values[1] === digit));
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
          const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

          return intersection.length === 0 && !isSelected && !isColumnUsed && isPriority;
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers, values}) => {
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
          const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

          return intersection.length === 0 && !isSelected && !isColumnUsed;
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers}) => {
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);

          return intersection.length === 0 && !isSelected
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers}) =>
          this.getArraysDifference(combinationsForBrothers, this.usedCombinations).length > 0 && !isSelected) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns?.filter(({isSelected}) => !isSelected) || [];
    }

    return columnsForCurrentLength;
  }

  private filterColumnsWithStrengthened(shuffledColumns: IProperColumn[]): IProperColumn[] {
    let columnsForCurrentLength = shuffledColumns
      ?.filter(({isSelected, combinationsForBrothers, values}) => {
        const isPriority = this.strengthenedDigits.every(digit => combinationsForBrothers.find(values => values[1] === digit));
        const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
        const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

        return intersection.length === 0 && !isSelected && !isColumnUsed && isPriority;
      }) || [];

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers, values}) => {
          const isPriority = this.strengthenedDigits.some(digit => combinationsForBrothers.find(values => values[1] === digit));
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
          const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

          return intersection.length === 0 && !isSelected && !isColumnUsed && isPriority;
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers, values}) => {
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);
          const isColumnUsed = this.excludedColumns.some(column => column.every((value, index) => value === values[index]));

          return intersection.length === 0 && !isSelected && !isColumnUsed;
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers}) => {
          const intersection = findIntersectionForTwoDimensionArray(this.usedCombinations, combinationsForBrothers);

          return intersection.length === 0 && !isSelected
        }) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns
        ?.filter(({isSelected, combinationsForBrothers}) =>
          this.getArraysDifference(combinationsForBrothers, this.usedCombinations).length > 0 && !isSelected) || [];
    }

    if (columnsForCurrentLength.length === 0) {
      columnsForCurrentLength = shuffledColumns?.filter(({isSelected}) => !isSelected) || [];
    }

    return columnsForCurrentLength;
  }

  private filterColumnsByGeneralAnswers(columns: IProperColumn[], usedColumns: IProperColumn[]) {
    const usedAnswers = usedColumns.map(({values}) => values.reduce((acc, value) => {
      acc = addFiveBasedNumbers(acc, value);
      return acc;
    }));

    return columns.filter(({values}) => {
      const answer = values.reduce((acc, value) => {
        acc = addFiveBasedNumbers(acc, value);
        return acc;
      });

      return !usedAnswers.includes(answer);
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arrayCopy = [...array];

    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }

    return arrayCopy;
  }

  private filterColumnsBySameSignAtSameIndexes(): Map<number, IProperColumn[]> {
    let lastColumnPossibleColumns = this.properRows.get(this.columnsLength[this.columnsLength.length - 1]) || [];

    console.log('this.strengthenedDigits');
    console.log(this.strengthenedDigits);
    console.log('this.strengthenedDigits');
    if (this.strengthenedDigits.length > 0) {
      lastColumnPossibleColumns = lastColumnPossibleColumns
        .filter(({combinationsForBrothers}) => this.strengthenedDigits
          .every(digit => combinationsForBrothers.find(values => values[1] === digit))
        ) || [];
    } else {
      lastColumnPossibleColumns = lastColumnPossibleColumns
        .filter(({combinationsForBrothers}) => this.priorityDigits
          .every(digit => combinationsForBrothers.find(values => values[1] === digit))
        ) || [];
    }

    if (lastColumnPossibleColumns.length === 0) {
      lastColumnPossibleColumns = lastColumnPossibleColumns
        .filter(({combinationsForBrothers}) => this.priorityDigits
          .some(digit => combinationsForBrothers.find(values => values[1] === digit))
        ) || [];
    }

    if (lastColumnPossibleColumns.length === 0) {
      lastColumnPossibleColumns = this.properRows.get(this.columnsLength[this.columnsLength.length - 1]) || [];
    }

    if (!lastColumnPossibleColumns) {
      return new Map<number, IProperColumn[]>();
    }

    if (this.columnsLength.length === 1) {
      return (new Map()).set(this.columnsLength[this.columnsLength.length - 1], lastColumnPossibleColumns);
    }

    lastColumnPossibleColumns
      .splice(0, 20, ...lastColumnPossibleColumns.slice(0, 40).sort(() => Math.random() - 0.5));

    for (let columnIndex = 0; columnIndex < lastColumnPossibleColumns.length; columnIndex++) {

      const column = lastColumnPossibleColumns[columnIndex];
      const filteredColumns: Map<number, IProperColumn[]> = new Map();
      const result: number[][] = [];
      for (let rowIndex = 0; rowIndex < this.maxRowsAmount; rowIndex++) {
        const currentRow = [];
        const currentSign = column.values[rowIndex] > 0 ? 'positive' : 'negative';

        for (let digitIndex = 0; digitIndex < this.digits - 1; digitIndex++) {
          const isZero = digitIndex < this.digits - this.rowsLengths[rowIndex];

          if (isZero) {
            currentRow.push(0);
            continue;
          }

          if (this.columnsLength[digitIndex] === 1) {
            if (currentSign === 'negative') {
              break;
            }

            currentRow.push(1);
            filteredColumns.set(1, [{
              combinationsForBrothers: [],
              brothersNumberCount: 0,
              uniqueNumberAmount: 0,
              isSelected: false,
              values: [getRandomFromList(this.possibleDigits['simple'].filter(value => value > 0) || [1, 2, 3, 4, 10, 11, 12, 13])]
            }]);
            continue;
          }

          const indexAtColumns = result.filter(value => value[digitIndex] !== 0).length;

          let currentFilteredColumns = filteredColumns.get(this.columnsLength[digitIndex]);
          if (!currentFilteredColumns && this.properRows.get(this.columnsLength[digitIndex])) {
            filteredColumns.set(this.columnsLength[digitIndex], [...this.properRows.get(this.columnsLength[digitIndex])!]);
            currentFilteredColumns = filteredColumns.get(this.columnsLength[digitIndex]);
          }

          const filtered = currentFilteredColumns?.filter((column) => {
            if (currentSign === 'positive') {
              return column.values[indexAtColumns] > 0;
            } else {
              return column.values[indexAtColumns] < 0;
            }
          }) || [];

          if (filtered.length === 0) {
            break;
          }

          filteredColumns.set(this.columnsLength[digitIndex], filtered);

          currentRow.push(1);
        }

        if (currentRow.length < this.digits - 1) {
          break;
        }

        result.push(currentRow);
      }

      if (result.length === this.maxRowsAmount) {
        this.lastColumn = column;
        return filteredColumns;
      }
    }

    return new Map<number, IProperColumn[]>();
  }

  private generateRowsLengths(): void {
    this.rowsLengths = [];
    for (let rowIndex = 0; rowIndex < this.maxRowsAmount; rowIndex++) {
      this.rowsLengths.push(this.getDigitsAmountByAlternationMode());
    }
  }

  private generateColumnsLengths(): void {
    this.columnsLength = [];
    for (let columnsIndex = 0; columnsIndex < this.digits; columnsIndex++) {
      const currentColumnLength = this.rowsLengths.reduce((acc, rowLength) => {
        if (columnsIndex >= this.digits - rowLength) {
          return acc += 1;
        }
        return acc;
      }, 0);
      this.columnsLength.push(currentColumnLength);
    }
  }

  private getDigitsAmountByAlternationMode(): number {
    let computedDigits = this.digits;

    switch (this.alternationMode) {
      case 'no':
        break;
      case 'on':
        computedDigits = this.usedDigits.length % 2 === 0 ? this.digits - 1 : this.digits;
        break;
      case 'double':
        const previousDigit = this.usedDigits.length > 0 ? this.usedDigits[this.usedDigits.length - 1] : null;

        if (previousDigit) {
          if (previousDigit === this.digits) {
            computedDigits = previousDigit - 2;
          } else {
            computedDigits = previousDigit + 1;
          }
        } else {
          computedDigits = getRandomFromList([this.digits - 2, this.digits - 1, this.digits]);
        }
        break;
      case 'multiple' :
        const digitsList = getNumbersRange(1, this.digits);
        const digitsWithoutUsed = digitsList.filter(digit => !this.usedDigits.includes(digit));

        const possibleDigitsAmount = digitsWithoutUsed.length > 0 ? digitsWithoutUsed : digitsList;
        if (digitsWithoutUsed.length === 0) {
          this.usedDigits = [];
        }
        computedDigits = getRandomFromList(possibleDigitsAmount);
        break;
      default:
        computedDigits = this.digits;
    }

    this.usedDigits.push(computedDigits);

    return Math.max(computedDigits, 1);
  }

  private getAllProperColumns(depth: number, currentColumn: number[], answer: number): void {
    if (depth > 1) {
      if (!this.properRows.get(depth)) {
        this.properRows.set(depth, []);
      }

      const brothersCombinations = this.getBrothersCombinationsAtColumn(currentColumn);
      const uniqueNumberAmount = currentColumn.filter((digit, index) => currentColumn.indexOf(digit) === index).length;

      if (this.possibleModes.includes("brothers") && brothersCombinations.length > 0) {
        this.properRows.get(depth)?.push({
          values: currentColumn,
          brothersNumberCount: brothersCombinations.length,
          uniqueNumberAmount,
          isSelected: false,
          combinationsForBrothers: brothersCombinations
        });
      } else if (!this.possibleModes.includes("brothers")) {
        this.properRows.get(depth)?.push({
          values: currentColumn,
          brothersNumberCount: 0,
          uniqueNumberAmount,
          isSelected: false,
          combinationsForBrothers: []
        });
      } else if (this.isAllDischarge && this.possibleModes.includes("brothers") && brothersCombinations.length === 0) {
        this.properSimpleRows.get(depth)?.push({
          values: currentColumn,
          brothersNumberCount: 0,
          uniqueNumberAmount,
          isSelected: false,
          combinationsForBrothers: []
        });
      }
    }

    if (depth < this.maxRowsAmount) {
      this.getPossibleDigitsForAllModesByDigit(answer, currentColumn).forEach(value => {
        if (value !== -currentColumn[currentColumn.length - 1]) {
          this.getAllProperColumns(depth + 1, [...currentColumn, value], addFiveBasedNumbers(answer, value));
        }
      });
    }
  }

  private getPossibleDigitsForAllModesByDigit(digit: number, row: number[]): number[] {
    const brothersNumbers = this.possibleValuesTables.get('brothers')?.get(digit)?.filter(value => value
      !== -row[row.length - 1]) || [];
    const simpleNumbers = this.possibleValuesTables.get('simple')?.get(digit)?.filter(value => value
      !== -row[row.length - 1]) || [];
    if (this.possibleModes.includes('brothers') && brothersNumbers?.length > 0) {
      return brothersNumbers;
    } else {
      return simpleNumbers;
    }
  }

  private isBrothersHasInRow(row: number[]): boolean {
    let answer = 0;
    const result = row.some(value => {
      const isValid = this.possibleValuesTables.get('brothers')?.get(answer)?.includes(value);
      answer = addFiveBasedNumbers(answer, value);

      return isValid;
    })

    return result;
  }

  private getBrothersNumberAmountInRow(row: number[]): number {
    let answer = 0;
    let result = 0;

    row.forEach(value => {
      if (this.possibleValuesTables.get('brothers')?.get(answer)?.includes(value)) {
        result += 1;
      }

      answer = addFiveBasedNumbers(answer, value);
    })

    return result;
  }

  private getBrothersCombinationsAtColumn(column: number[]): number[][] {
    const combinations: number[][] = [];
    let answer = 0;

    column.forEach((value, index) => {
      if (this.possibleValuesTables.get('brothers')?.get(answer)?.includes(value)) {
        const prevValue = column[index - 1];

        combinations.push([prevValue, value]);
      }

      answer = addFiveBasedNumbers(answer, value);
    });

    return combinations;
  }

  public generatePossibleValuesTables(): Map<Mode, Map<number, number[]>> {
    this.possibleModes.forEach(mode => {
        const possibleValues: Map<number, number[]> = new Map<number, number[]>();

        let k = -14;
        while (compareFiveBasedNumbers(k, 20) === -1) {
          const values = this.getPossibleValuesByMode(mode).filter(value => this.isValidDigitForCurrentAnswerByMode(k, mode, value));
          possibleValues.set(k, values);
          k = addFiveBasedNumbers(k, 1)
        }

        this.possibleValuesTables.set(mode, possibleValues);
      }
    );

    return this.possibleValuesTables;
  }

  private isValidDigitForCurrentAnswerByMode(answer: number, mode: Mode, value: number): boolean {
    switch (mode) {
      case "simple":
        return this.isValidDigitForSimpleMode(answer, value);
      case "brothers":
        return this.isValidDigitForBrothersMode(answer, value)
    }
  }

  private isValidDigitForSimpleMode(answer: number, value: number): boolean {
    if (value === 0) {
      return false;
    }

    if (addFiveBasedNumbers(answer, value) === 0 && this.possibleModes.length > 1) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(answer, value), 0) === -1) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(answer, value), 20) !== -1) {
      return false;
    }

    if (getNumberOfDigitsInFiveBasedSystem(answer) > 1
      && getNumberOfDigitsInFiveBasedSystem(value) === 1
      && (addFiveBasedNumbers(getLastDigitInFiveBasedSystem(answer), value) < 0
        || addFiveBasedNumbers(getLastDigitInFiveBasedSystem(answer), value) > 4)) {
      return false;
    }

    if (
      getNumberOfDigitsInFiveBasedSystem(answer) === 1
      && getNumberOfDigitsInFiveBasedSystem(value) === 1
      && getNumberOfDigitsInFiveBasedSystem(addFiveBasedNumbers(answer, value)) > 1
    ) {
      return false;
    }

    return true;
  }

  private isValidDigitForBrothersMode(answer: number, value: number): boolean {
    if (answer < 1) {
      return false;
    }

    if (value === 0) {
      return false;
    }

    if (addFiveBasedNumbers(answer, value) === 0) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(answer, value), 0) === -1) {
      return false;
    }

    if (compareFiveBasedNumbers(addFiveBasedNumbers(answer, value), 20) !== -1) {
      return false;
    }

    if (getNumberOfDigitsInFiveBasedSystem(answer) > 1
      && getNumberOfDigitsInFiveBasedSystem(value) === 1
      && (addFiveBasedNumbers(getLastDigitInFiveBasedSystem(answer), value) >= 0
        || addFiveBasedNumbers(getLastDigitInFiveBasedSystem(answer), value) > 4)) {
      return false;
    }

    if (getNumberOfDigitsInFiveBasedSystem(answer) === 1
      && getNumberOfDigitsInFiveBasedSystem(value) > 1
    ) {
      return false;
    }

    if (
      getNumberOfDigitsInFiveBasedSystem(answer) === 1
      && getNumberOfDigitsInFiveBasedSystem(value) === 1
      && getNumberOfDigitsInFiveBasedSystem(addFiveBasedNumbers(answer, value)) === 1
    ) {
      return false;
    }


    if (getNumberOfDigitsInFiveBasedSystem(answer) === 2 && getNumberOfDigitsInFiveBasedSystem(value) === 2) {
      return false;
    }

    return true;

  }

  private getPossibleValuesByMode(mode: Mode): number[] {
    switch (mode) {
      case "simple":
        return this.possibleDigits.simple;
      case "brothers":
        return this.possibleDigits.brothers;
      default:
        return [];
    }
  }

  private reset(): void {
    this.rows = [];
    this.maxRowsAmount = 1;
    this.digits = 1;
    this.possibleDigits = {brothers: [], simple: []};
    this.possibleAnswers = {brothers: [], simple: []};
    this.limit = null;
    this.isLimitedIntermediateAnswer = false;
    this.possibleModes = ['simple'];
    this.alternationMode = 'no';
    this.usedDigits = [];
    this.properRows = new Map();
    this.columnsLength = [];
    this.rowsLengths = [];
    this.lastColumn = null;
    this.usedCombinations = [];
    this.excludedColumns = [];
    this.priorityDigits = [];
    this.selectedColumns = [];

  }

}
