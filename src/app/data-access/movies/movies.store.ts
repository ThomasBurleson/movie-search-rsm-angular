import { map, withLatestFrom } from 'rxjs/operators';

import { createStore, withProps, elfHooks, deepFreeze, emitOnce } from '@ngneat/elf';
import { withEntities, withActiveIds, upsertEntities, deleteAllEntities } from '@ngneat/elf-entities';
import { withRequestsStatus, selectRequestStatus, updateRequestStatus, createRequestsStatusOperator } from '@ngneat/elf-requests';
import {
  withPagination,
  updatePaginationData,
  getPaginationData,
  hasPage as pageExists,
  setPage,
  setCurrentPage,
  selectCurrentPageEntities,
  deleteAllPages,
} from '@ngneat/elf-pagination';

import { initState, MovieState, MovieItem, Pagination, StoreSelector, isLoading } from './movies.model';
import { computeFilteredMovies } from './movies.filters';

const MOVIES = 'movies';

// AutoFreeze store state
elfHooks.registerPreStoreUpdate((currentState, nextState) => {
  return deepFreeze(nextState);
});

export class MovieStore {
  /**
   * Create store and streams for movies$, status$, and state$
   * Note: state$ includes computed properties and pagination
   */
  private _store = createStore(
    { name: MOVIES }, // store name
    withProps<MovieState>(initState()), // MovieState
    withEntities<MovieItem>(), // entity collection for Movies
    withRequestsStatus<'movies'>(), // store activity status features
    withPagination(), // support MovieItem pagination
    withActiveIds() // support selections of 0...n entity items
  );

  movies$ = this._store.pipe(selectCurrentPageEntities());
  status$ = this._store.pipe(selectRequestStatus(MOVIES));
  isLoading$ = this.status$.pipe(map(isLoading));
  state$ = this._store.pipe(
    withLatestFrom(this.movies$),
    map(([state, allMovies]) => {
      return {
        ...state,
        allMovies,
        pagination: this._store.query(getPaginationData()),
        filteredMovies: computeFilteredMovies(allMovies, state.filterBy),
      };
    })
  );

  /**
   * Create RxJS operator to easily track REST calls
   * NOTE: this is used in the MovieFacade
   */
  trackLoadStatus = createRequestsStatusOperator(this._store)(MOVIES);

  /**********************************************
   * Store Methods
   **********************************************/

  /**
   * Set cache and page information for remote search
   */
  updateMovies(movies: MovieItem[], paging: Partial<Pagination>, searchBy?: string) {
    const hasSearchBy = searchBy !== undefined && searchBy !== null;
    const clearCache = hasSearchBy ? this._store.query((s) => s.searchBy) !== searchBy : false;
    const pagination = { ...this._store.query(getPaginationData()), ...paging };
    const updateSearchBy = (state) => ({
      ...state,
      searchBy: hasSearchBy ? searchBy : state.searchBy,
    });

    emitOnce(() => {
      if (clearCache) {
        // If the searchBy criteria changes CLEAR ALL primary caches!
        this._store.update(deleteAllPages());
        this._store.update(deleteAllEntities());

        // Clear the stale 'pages' registry (if present)
        delete pagination.pages;
      }
      this._store.update(
        updateSearchBy,
        upsertEntities(movies),
        updateRequestStatus(MOVIES, 'success'),
        updatePaginationData(pagination),
        setPage(
          pagination.currentPage,
          movies.map((it) => it.id)
        ),
        setCurrentPage(paging.currentPage)
      );
    });
  }

  /**
   * Update 'filterBy' criteria and emit filteredMovies update
   */
  updateFilter(filterBy?: string) {
    this._store.update((state) => ({
      ...state,
      filterBy: filterBy || '',
    }));
  }

  /**
   * Query support for snapshots of current internal store state...
   * synchronously extract state value using selector
   */
  useQuery<T extends unknown>(selector: StoreSelector<T>): T {
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
    const params = [MOVIES, ...(!!error ? ['error', error] : [flag])];
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
  addPage(movies: MovieItem[], page: number) {
    if (movies.length) {
      if (!this.pageInRange(page)) {
        const { total } = this._store.query(getPaginationData());
        throw new Error(`addPage(${page}) is out of 0-${total} range`);
      }

      this._store.update(
        upsertEntities(movies),
        setPage(
          page,
          movies.map((it) => it.id)
        )
      );
    }
  }
}

/**********************************************
 * Export MovieStore instance
 **********************************************/
