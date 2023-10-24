import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-numbers-select',
  templateUrl: './numbers-select.component.html',
  styleUrls: ['./numbers-select.component.css']
})
export class NumbersSelectComponent {
  @Input()
  numbers: number[] = [];

  @Input()
  set defaultValue(value: number[]) {
    this.selectedNumbers = value;
  }

  selectedNumbers: number[] = [];

  @Output()
  onChange: EventEmitter<number[]> = new EventEmitter<number[]>();

  handleNumberClick = (number: number) => {
    if (this.selectedNumbers.includes(number)) {
      this.selectedNumbers = this.selectedNumbers.filter(value => value !== number);
    } else {
      this.selectedNumbers.push(number);
    }

    this.onChange.emit(this.selectedNumbers);
  }

  handleCloseButtonClick = () => {
    this.selectedNumbers = [];
  }

  handleCheckButtonClick = () => {
    this.selectedNumbers = [...this.numbers];
  }

}
