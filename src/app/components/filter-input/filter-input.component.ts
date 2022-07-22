import { Input, Output, EventEmitter, Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'filter-input',
  templateUrl: './filter-input.component.html',
})
export class FilterInput {
  @Input() filterBy: string;

  @Output() onFilter = new EventEmitter<string>();

  form = this.fb.group({
    searchBy: new FormControl(''),
    filterBy: new FormControl(''),
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const filterBy = this.form.controls['filterBy'];

    // When 'filterBy' input value changes, auto request filter update
    filterBy.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe((v) => {
      this.onFilter.emit(v);
    });

    filterBy.setValue(this.filterBy);
  }

  clearOnEscape(event?: KeyboardEvent) {
    if (!event || event.keyCode === 27) {
      const filterBy = this.form.controls['filterBy'];
      filterBy.setValue('');
    }
  }
}
