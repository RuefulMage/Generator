import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IOption} from "../../types/options";
import {Alternation} from "../../types/settings";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {

  @Input()
  name: string = '';

  @Input()
  set defaultValue(value: string | number) {
    this.value = value;
  }

  @Input()
  options: IOption[] = [];

  @Output()
  onChange: EventEmitter<string> = new EventEmitter<string>();

  value: string | number = '';

  handleChange = (event: Event) => {
    this.value = (event.target as HTMLInputElement).id;
    this.onChange.emit(this.value);
  }
}
