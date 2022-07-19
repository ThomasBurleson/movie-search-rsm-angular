import { Output, Component, ChangeDetectionStrategy, EventEmitter, Input } from '@angular/core';
import { Pagination } from '../../data-access';

@Component({
  selector: 'pagination-bar',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationBar {
  @Input()
  public pagination: Pagination;
  public pages = [1, 2, 3];

  /**
   * For the specified gotoToPage button, build a style
   */
  public stylePageLink(page: number): string {
    const isSelected = this.pagination.currentPage === page + 1;
    const buttonStyle = 'relative inline-flex items-center px-4 py-2 border text-sm font-medium';
    const selectionStyle = isSelected
      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

    return selectionStyle + buttonStyle;
  }
}
