import { FormBuilder, FormControl } from '@angular/forms';
import { Input, Output, EventEmitter, Component } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'header-bar',
  templateUrl: './header.component.html',
})
export class HeaderBar {
  @Input() searchFor: string;
  @Input() filterBy: string;

  @Output() onLoad = new EventEmitter<string>();
  @Output() onClear = new EventEmitter<void>();
  @Output() onFilter = new EventEmitter<string>();

  form = this.fb.group({
    searchBy: new FormControl(''),
    filterBy: new FormControl(''),
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const filterBy = this.form.controls['filterBy'];
    const searchFor = this.form.controls['searchBy'];

    // When 'filterBy' input value changes, auto request filter update
    filterBy.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v) => {
        this.onFilter.emit(v);
      });

    filterBy.setValue(this.filterBy);
    searchFor.setValue(this.searchFor);
  }

  clearOnEscape(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      const filterBy = this.form.controls['filterBy'];
      filterBy.setValue('');
    }
  }
}
