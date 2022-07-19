import { Input, Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

type ListItem = { id: string; name: string };

@Component({
  selector: 'check-group',
  templateUrl: './check-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckGroup {
  private _selected: ListItem[] = [];

  @Output() onSelectionChange = new EventEmitter<string[]>();

  @Input() title: string;
  @Input() list: ListItem[] = [];
  @Input() highlighted: number[] = [];
  @Input() set selected(items: ListItem[]) {
    this._selected = items;
    this.highlighted = [];
  }
  get selected(): ListItem[] {
    return this._selected;
  }

  isSelected({ id }: ListItem) {
    return this.selected.find((it) => it.id === id);
  }

  isHighlighted(item: ListItem) {
    return this.highlighted?.find((id) => parseInt(item.id) == id);
  }

  trackById(index: number, item: ListItem) {
    return item.id;
  }

  onDeselectAll() {
    this.onSelectionChange.emit([]);
  }

  /**
   * On checkbox 'check' change
   */
  onToggleSelect(item: ListItem) {
    const selectedIds = this.selected.map((it) => it.id);
    const checked = !(selectedIds.indexOf(item.id) > -1);
    const selections = checked ? [...selectedIds, item.id] : selectedIds.filter((current: string) => current !== item.id);

    /**
     * Emit ids of all selected items
     */
    this.onSelectionChange.emit(selections);
  }
}
