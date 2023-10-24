import {Component, OnInit, Optional} from '@angular/core';
import {ALTERNATION_OPTIONS, IOption} from "../../types/options";
import {DEFAULT_SETTINGS, ISettings} from "../../types/settings";
import {MainGeneratorService} from "../../services/main-generator.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  readonly alternationOptions: IOption[] = ALTERNATION_OPTIONS;

  settings: ISettings = DEFAULT_SETTINGS;

  constructor(private generator: MainGeneratorService) {
  }

  handleSettingsChange = (changedFields: Partial<ISettings>) => {
    this.settings = {
      ...this.settings,
      ...changedFields
    }
  }

  generateExamples = () => {
    this.generator.generate(this.settings);
  }
}
