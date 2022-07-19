import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Store, createStore, withProps, elfHooks, deepFreeze } from '@ngneat/elf';
import { withEntities, withActiveIds, upsertEntities, getAllEntities } from '@ngneat/elf-entities';
import {
  withRequestsStatus,
  selectRequestStatus,
  updateRequestStatus,
  createRequestsStatusOperator,
  StatusState,
} from '@ngneat/elf-requests';
import {
  PaginationData,
  withPagination,
  getPaginationData,
  hasPage as pageExists,
  setPage,
  setCurrentPage,
  selectPaginationData,
  updatePaginationData,
} from '@ngneat/elf-pagination';
import { readFirst } from '../readFirst.operator';

export interface Pagination extends PaginationData {
  start: number; // 0-based index of first item in current page
  showPage?: (page: number) => void;
  end: number; // 0-based index of last item in current page
}
export const isLoading = (s: StatusState) => s.value === 'pending';
export type StoreSelector<T extends unknown> = (s: any) => T;

/**
 * Selector to quickly determine isLoading state
 */
export { StatusState } from '@ngneat/elf-requests';

/**
 * AutoFreeze store state
 */
elfHooks.registerPreStoreUpdate((currentState, nextState) => {
  return deepFreeze(nextState);
});

/**
 * Simple Paginated Reactive Store
 * Manages construction of internal store, pagination, and status$ options
 */
export class PaginatedStore<T extends unknown, K extends { id: string }> {
  protected _store: Store;

  constructor(protected storeName: string, initState: () => T) {
    /**
     * Create store and streams for movies$, status$, and state$
     * Note: state$ includes computed properties and pagination
     */
    this._store = createStore(
      { name: storeName }, // store name
      withProps<T>(initState()), // MovieState
      withEntities<K>(), // entity collection for Movies
      withRequestsStatus(), // store activity status features
      withPagination(), // support MovieItem pagination
      withActiveIds() // support selections of 0...n entity items
    );

    const isSameData = (x, y): boolean =>
      x.currentPage === y.currentPage && x.lastPage === y.lastPage && x.perPage === y.perPage && x.total === y.total;

    this.status$ = this._store.pipe(selectRequestStatus(storeName));
    this.isLoading$ = this.status$.pipe(map(isLoading));

    this.pagination$ = this._store.pipe(
      selectPaginationData(),
      distinctUntilChanged(isSameData),
      map(({ pages, ...data }) => {
        const start = data.currentPage ? (data.currentPage - 1) * data.perPage : 0;
        const end = Math.min(start + data.perPage, data.total);
        const showPage = (page: number) => this.selectPage.bind(this);

        return {
          ...data, // PaginationData
          ...{
            start, // extras fields for Pagination
            end,
            showPage,
          },
        };
      })
    );

    this.trackLoadStatus = createRequestsStatusOperator(this._store)(storeName);

    /**
     * Initialize to Page 1
     */
    this._store.update(
      updatePaginationData({
        currentPage: 0,
        lastPage: 0,
        perPage: 0,
        total: 0,
      })
    );
  }

  public status$: Observable<StatusState>;
  public isLoading$: Observable<boolean>;
  public pagination$: Observable<Pagination>;
  /**
   * Create RxJS operator to easily track REST calls
   * NOTE: this is used in the MovieFacade
   */
  public trackLoadStatus: MonoTypeOperatorFunction<unknown>;

  /**********************************************
   * Store Methods
   **********************************************/

  /**
   * Query support for snapshots of current internal store state...
   * synchronously extract state value using selector
   */
  useQuery<T>(selector: StoreSelector<T>): T {
    return this._store.query<T>(selector);
  }

  reset() {
    this._store.reset();
  }

  /**********************************************
   * Status Features
   **********************************************/

  /**
   * Easily update the status of the MovieStore
   * 'busy'|'succes'|'idle'|'error' for store activity
   *
   * @see https://ngneat.github.io/elf/docs/features/requests/requests-status/#updaterequestsstatus
   */
  updateStatus(flag: 'success' | 'idle' | 'pending', error?: any) {
    const params = [this.storeName, ...(!!error ? ['error', error] : [flag])];
    this._store.update(updateRequestStatus.apply(null, params));
  }

  /**
   * 'busy' | 'success' for store activity
   */
  setLoading(isLoading = true) {
    this.updateStatus(isLoading ? 'pending' : 'idle');
  }

  /**********************************************
   * Pagination Methods
   **********************************************/

  pageInRange(page: number): boolean {
    const { lastPage, total } = this._store.query(getPaginationData());
    return total < 1 ? false : page > 0 && page <= lastPage;
  }

  hasPage(page: number): boolean {
    return this._store.query(pageExists(page));
  }

  selectPage(page: number): boolean {
    const found = this.hasPage(page);
    found && this._store.update(setCurrentPage(page));

    return found;
  }

  /**
   * Add page of movies WITHOUT changing active page or pagination information
   */
  addPage(items: K[], page: number) {
    if (items.length) {
      const data = buildPaginationData(this._store, items, page);

      this._store.update(
        upsertEntities(items),
        updatePaginationData(data),
        setPage(
          page,
          items.map((it) => it.id)
        )
      );
    }
  }
}

/**
 * Configure pagination data (if needed) with updates
 *  - if adding and no pages, set first page
 *  - update page size if adding to same page
 *  - update lastPage
 *  - update total count (if 0)
 */
function buildPaginationData(store: Store, items: unknown[], page: number): PaginationData {
  const current: PaginationData = { ...store.query(getPaginationData()) };

  if (items.length > 0) {
    current.currentPage ||= 1;
    current.total ||= items.length;

    if (current.currentPage == page) {
      current.perPage += items.length;
      current.total += items.length;
    }
    if (page > current.lastPage) current.lastPage = page;
  }

  return { ...current };
}
