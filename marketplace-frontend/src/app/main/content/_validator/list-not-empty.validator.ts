import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { isNullOrUndefined } from "util";



// validation function
export function listNotEmptyValidator() : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        let valid = true;
        let msg = '';
        

        if (isNullOrUndefined(control.value)) {
            valid = false;
            msg = 'undefined'
        }

        let list = control.value as FormArray;

        
        if (list.length <= 0) {
            valid = false;
            msg = "length: " + list.length;
        }

        return !valid ? {'listnotempty': {'listnotempty': "not undefined or empty", 'actual': msg}} : null;
    }
}



  