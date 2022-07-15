import { Input, Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

type ListItem = { id: string; name: string };

@Component({
  selector: 'check-group',
  templateUrl: './check-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckGroup {
  @Input() title: string;
  @Input() selected: ListItem[];
  @Input() list: ListItem[];

  @Output() onSelectionChange = new EventEmitter<string[]>();

  isSelected({ id }: ListItem) {
    return this.selected.find((it) => it.id === id);
  }

  trackById(index: number, item: ListItem) {
    return item.id;
  }

  /**
   * On checkbox 'check' change
   */
  onToggleSelect(ev: any) {
    const { id, checked } = event.target as HTMLInputElement;
    const selectedIds = this.selected.map((it) => it.id);
    const selections = checked ? [...selectedIds, id] : selectedIds.filter((current: string) => current !== id);

    /**
     * Emit ids of all selected items
     */
    this.onSelectionChange.emit(selections);
  }
}
