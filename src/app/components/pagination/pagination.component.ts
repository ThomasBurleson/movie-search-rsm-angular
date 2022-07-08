import { Output, Component, ChangeDetectionStrategy, EventEmitter, Input } from '@angular/core';
import { Pagination } from '../../data-access';

@Component({
  selector: 'pagination-bar',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationBar {
  public selected = 0;
  public start = 0;
  public end = 0;
  public total = 0;
  public pages = [1, 2, 3];

  /**
   * For the specified gotoToPage button, build a style
   */
  public stylePageLink(page: number): string {
    const isSelected = this.selected === page + 1;
    const buttonStyle = 'relative inline-flex items-center px-4 py-2 border text-sm font-medium';
    const selectionStyle = isSelected
      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

    return selectionStyle + buttonStyle;
  }

  @Input()
  public set pagination({ total, currentPage, perPage }: Pagination) {
    this.total = total;
    this.selected = currentPage;
    this.start = (currentPage - 1) * perPage;
    this.end = Math.min(this.start + perPage, total);
  }

  @Output() onPageSelected = new EventEmitter<number>();
}
