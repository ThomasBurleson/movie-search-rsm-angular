import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store, createStore, withProps } from '@ngneat/elf';
import {
  withEntities,
  withActiveIds,
  upsertEntities,
  getAllEntities,
  deleteAllEntities,
  selectAllEntities,
  selectActiveEntities,
  setActiveIds,
  getActiveIds,
} from '@ngneat/elf-entities';
import {
  StatusState,
  createRequestsStatusOperator,
  selectRequestStatus,
  updateRequestStatus,
  withRequestsStatus,
  getRequestStatus,
} from '@ngneat/elf-requests';

const IDENTITY_REDUCER = () => (s: any) => s;

export interface Entity {
  id: string;
}
export interface SelectableListVM<T extends Entity> {
  list: T[];
  selected: T[];
  status: StatusState;
}

/**
 * 'SelectableList' is a Reactive EntityCollection that supports:
 *   - 0..n selections of items in a list.
 *   - status tracking for pending|success|idle|error
 *
 *  NOTE: this class does NOT use [internally] a paginated store.
 *        Pagination is not supported.
 */

export class SelectableList<T extends Entity> {
  readonly list$: Observable<T[]>;
  readonly selected$: Observable<T[]>;
  readonly status$: Observable<StatusState>;

  readonly vm$: Observable<SelectableListVM<T>>;

  get total(): number {
    return this._store.query<T[]>(getAllEntities()).length;
  }

  /**
   * Create RxJS operator to easily track REST calls
   * NOTE: this is used in the MovieFacade
   */
  trackLoadStatus;

  constructor(private storeName: string) {
    this._store = createStore(
      { name: storeName },
      withProps<{}>({}),
      withEntities<T>(), // entity collection for T
      withActiveIds(), // support selections of T
      withRequestsStatus() // store activity status features
    );

    const buildVM = ([list, selected, status]): SelectableListVM<T> => ({
      list,
      selected,
      status,
    });

    this.list$ = this._store.pipe(selectAllEntities());
    this.selected$ = this._store.pipe(selectActiveEntities());
    this.status$ = this._store.pipe(selectRequestStatus(storeName));
    this.vm$ = combineLatest([this.list$, this.selected$, this.status$]).pipe(map(buildVM));

    this.trackLoadStatus = createRequestsStatusOperator(this._store)(storeName);
  }

  /**********************************************
   * List Item Features
   **********************************************/

  /**
   * Add items to list; either merge into existing or clear first
   */
  addItems(list: T[], reset = false) {
    const deleteOnReset = reset ? deleteAllEntities : IDENTITY_REDUCER;

    this._store.update(deleteOnReset(), upsertEntities(list), updateRequestStatus(this.storeName, 'success'));
  }

  /**
   * Add specific items as selected... either add to existing or
   * set as current selected group
   */
  selectItems(list: T[], reset = false) {
    const ids = this.toIDs(list);
    this.selectItemsById(ids, reset);
  }

  /**
   * Add specific items as selected... either add to existing or
   * set as current selected group
   */
  selectItemsById(list: T['id'][], reset = false) {
    const current = !reset ? this._store.query(getActiveIds) : [];
    const merged = [...new Set([...current, ...list])];

    this._store.update(setActiveIds(merged));
  }

  /**
   * Easily selectAll or none
   */
  selectAll(flag = true) {
    const list: T[] = this._store.query<T[]>(getAllEntities());
    const ids = list.map((it) => it.id);

    this._store.update(setActiveIds(flag ? ids : []));
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
   * 'busy' | 'idle' for store activity
   */
  setLoading(isLoading = true) {
    this.updateStatus(isLoading ? 'pending' : 'idle');
  }

  /**********************************************
   * Private Features
   **********************************************/

  private toIDs(list: T[]) {
    return list.map((it) => it.id);
  }

  private _store: Store;
}
