import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent {

  @Input()
  name: string = '';

  @Input()
  set defaultValue(value: number) {
    this.value = value;
  }

  @Output()
  onChange: EventEmitter<number> = new EventEmitter<number>();

  value: number = 0;

  constructor() { }

  handleValueChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = parseInt(target.value);

    this.onChange.emit(this.value);
  }

}
