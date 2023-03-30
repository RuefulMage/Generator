export function isNegative(num: number): boolean {
  return num < 0;
}

export function convertDecimalToFive(decimal: number): string {
  if (decimal === 0) {
    return "0";
  }
  const isNegative = decimal < 0;
  let digits = "";
  while (decimal !== 0) {
    const remainder = Math.abs(decimal % 5);
    digits = remainder.toString() + digits;
    decimal = Math.floor(decimal / 5);
  }
  return isNegative ? "-" + digits : digits;
}

export function convertFiveToDecimal(five: string): number {
  const isNegative = five[0] === "-";
  const digits = isNegative ? five.substring(1) : five;
  let decimal = 0;
  for (let i = 0; i < digits.length; i++) {
    const digitValue = parseInt(digits[i], 5);
    decimal += digitValue * Math.pow(5, digits.length - i - 1);
  }
  return isNegative ? -decimal : decimal;
}

export function getRandomFive(min: number, max: number): string {
  const decimalMin = convertFiveToDecimal(min.toString());
  const decimalMax = convertFiveToDecimal((max.toString()));
  const decimalRandom = Math.floor(Math.random() * (decimalMax - decimalMin + 1) + decimalMin);
  return convertDecimalToFive(decimalRandom);
}

export function getRandomFromList<T>(list: T[]): T {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function compareFiveBasedNumbers(num1: number, num2: number): number {
  return compareFiveBasedNumbersByString(num1.toString(), num2.toString());
}

export function addFiveBasedNumbers(num1: number, num2: number): number {
  return parseInt(addFiveBasedNumbersByString(num1.toString(), num2.toString()));
}

export function subtractFiveBasedNumbers(num1: string, num2: string): string {
  if (compareFiveBasedNumbersByString(num1, num2) === -1) {
    return `-${subtractFiveBasedNumbers(num2, num1)}`;
  }

  // Дополним числа нулями слева до одинаковой длины
  const maxLength = Math.max(num1.length, num2.length);
  num1 = num1.padStart(maxLength, '0');
  num2 = num2.padStart(maxLength, '0');

  let result = '';
  let borrow = 0;

  // Вычитаем цифры чисел по очереди, начиная со старшего разряда
  for (let i = maxLength - 1; i >= 0; i--) {
    const digit1 = parseInt(num1[i], 5);
    const digit2 = parseInt(num2[i], 5);
    let diff = digit1 - digit2 - borrow;

    // Если результат отрицательный, занимаем единицу из старшего разряда
    if (diff < 0) {
      diff += 5;
      borrow = 1;
    } else {
      borrow = 0;
    }

    result = diff.toString() + result;
  }

  // Убираем лидирующие нули из результата
  result = result.replace(/^0+/, '');

  // Если результат пустой, значит num1 <= num2, возвращаем "0"
  if (result === '') {
    result = '0';
  }

  return result;
}

export function getLastDigitInFiveBasedSystem(number: number): number {
  const fiveBasedNumber = number.toString(5);
  return parseInt(fiveBasedNumber[fiveBasedNumber.length - 1], 5);
}

export function getFirstDigitInFiveBasedSystem(number: number): number {
  const fiveBasedNumber = number.toString(5);
  return parseInt(fiveBasedNumber[0], 5);
}

export function getNumberOfDigitsInFiveBasedSystem(number: number): number {
  const fiveBasedNumber = number.toString(5);

  if (fiveBasedNumber[0] === '-') {
    return fiveBasedNumber.substring(1).length;
  }
  return fiveBasedNumber.length;
}



function compareFiveBasedNumbersByString(num1: string, num2: string): number {
  // Если оба числа отрицательные, меняем их знак и сравниваем их по модулю
  if (num1.startsWith('-') && num2.startsWith('-')) {
    num1 = num1.substring(1);
    num2 = num2.substring(1);
    return -compareFiveBasedNumbersByString(num1, num2);
  }

  // Если только первое число отрицательное, второе число точно больше
  if (num1.startsWith('-')) {
    return -1;
  }

  // Если только второе число отрицательное, первое число точно больше
  if (num2.startsWith('-')) {
    return 1;
  }

  // Дополним числа нулями слева до одинаковой длины
  const maxLength = Math.max(num1.length, num2.length);
  num1 = num1.padStart(maxLength, '0');
  num2 = num2.padStart(maxLength, '0');

  // Сравниваем цифры чисел по очереди, начиная со старшего разряда
  for (let i = 0; i < maxLength; i++) {
    const digit1 = parseInt(num1[i], 5);
    const digit2 = parseInt(num2[i], 5);
    if (digit1 > digit2) {
      return 1;
    } else if (digit1 < digit2) {
      return -1;
    }
  }

  // Если все цифры совпадают, числа равны
  return 0;
}

function addFiveBasedNumbersByString(num1: string, num2: string): string {
  // Если оба числа отрицательные, складываем их по модулю и добавляем знак "-"
  if (num1.startsWith('-') && num2.startsWith('-')) {
    num1 = num1.substring(1);
    num2 = num2.substring(1);
    return '-' + addFiveBasedNumbersByString(num1, num2);
  }

  // Если только первое число отрицательное, вычитаем из второго числа первое по модулю
  if (num1.startsWith('-')) {
    num1 = num1.substring(1);
    return subtractFiveBasedNumbers(num2, num1);
  }

  // Если только второе число отрицательное, вычитаем из первого числа второе по модулю
  if (num2.startsWith('-')) {
    num2 = num2.substring(1);
    return subtractFiveBasedNumbers(num1, num2);
  }

  // Дополним числа нулями слева до одинаковой длины
  const maxLength = Math.max(num1.length, num2.length);
  num1 = num1.padStart(maxLength, '0');
  num2 = num2.padStart(maxLength, '0');

  let carry = 0; // Переменная для хранения переноса
  let result = ''; // Строка для записи результата

  // Складываем цифры чисел по очереди, начиная со младшего разряда
  for (let i = maxLength - 1; i >= 0; i--) {
    const digit1 = parseInt(num1[i], 5);
    const digit2 = parseInt(num2[i], 5);
    const sum = digit1 + digit2 + carry;
    const digitSum = sum % 5;
    carry = Math.floor(sum / 5);
    result = digitSum.toString() + result;
  }

  // Если остался перенос, добавляем его к результату
  if (carry > 0) {
    result = carry.toString() + result;
  }

  // Удаляем ведущие нули из результата
  result = result.replace(/^0+/, '');

  // Если результат пустой, то сумма равна нулю
  if (result === '') {
    return '0';
  }

  return result;
}

export function getArrayDifference<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => !b.includes(x));
}

export function getArrayModulesDifference(a: number[], b: number[]): number[] {
  return a.filter((x) => {
    return !(b.includes(x) || b.includes(-x));
  });
}
