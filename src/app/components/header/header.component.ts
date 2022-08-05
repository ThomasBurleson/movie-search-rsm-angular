import { Input, Output, EventEmitter, Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'header-bar',
  templateUrl: './header.component.html',
})
export class HeaderBar {
  @Input() set searchFor(val: string) {
    const searchFor = this.form.controls['searchBy'];
    searchFor.setValue(val);
  }

  @Output() onLoad = new EventEmitter<string>();
  @Output() onClear = new EventEmitter<void>();

  form = this.fb.group({
    searchBy: new FormControl(''),
    filterBy: new FormControl(''),
  });

  constructor(private fb: FormBuilder) {}
}
