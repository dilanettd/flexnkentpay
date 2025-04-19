import { AbstractControl, ValidatorFn } from '@angular/forms';

export function cameroonPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const valid = /^6\d{8}$/.test(control.value);

    return valid ? null : { cameroonPhone: { value: control.value } };
  };
}
