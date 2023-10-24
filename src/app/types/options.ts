export interface IOption {
  value: string | number;
  label: string | number;
}

export const ALTERNATION_OPTIONS: IOption[] = [
  {value: 'no', label: 'Нет'},
  {value: 'on', label: 'Обычное'},
  {value: 'double', label: 'Двойное'},
  {value: 'multiple', label: 'Множественное'},
]
