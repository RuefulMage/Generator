export type Alternation = 'no' | 'on' | 'double' | 'multiple';

export interface ISettings {
  rows: number;
  digits: number;
  alternation: string;
  isSimpleMode: boolean;
  isBrothersMode: boolean;
  positiveSimplePossibleDigits: number[];
  negativeSimplePossibleDigits: number[];
  positiveBrothersPossibleDigits: number[];
  negativeBrothersPossibleDigits: number[];
  isLimitedIntermediateAnswer?: boolean;
}

export const DEFAULT_SETTINGS: ISettings = {
  alternation: 'no',
  digits: 2,
  isBrothersMode: false,
  isSimpleMode: true,
  negativeBrothersPossibleDigits: [-1, -2, -3, -4],
  negativeSimplePossibleDigits: [-1, -2, -3, -4, -5, -6, -7, -8, -9],
  positiveBrothersPossibleDigits: [1, 2, 3, 4],
  positiveSimplePossibleDigits: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: 2
}
