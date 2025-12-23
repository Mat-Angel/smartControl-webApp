import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtils } from '../../utils/form-utils';

@Component({
  selector: 'form-text-helper',
  imports: [],
  templateUrl: './form-text-helper.component.html',
})
export class FormTextHelperComponent {
  form =  input.required<FormGroup>();
  fieldName =  input.required<string>();
  formUtils = FormUtils;
}
