import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  @Input()
  checked = false;

  @Input()
  text: string = '';

  @Output()
  onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.onChange.emit(target.checked);
  }
}
