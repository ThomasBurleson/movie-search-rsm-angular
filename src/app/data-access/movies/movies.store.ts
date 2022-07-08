import { map, withLatestFrom } from 'rxjs/operators';

import { createStore, select, withProps, elfHooks, deepFreeze, emitOnce } from '@ngneat/elf';
import { withEntities, upsertEntities, deleteAllEntities } from '@ngneat/elf-entities';
import {
  withPagination,
  updatePaginationData,
  getPaginationData,
  hasPage as pageExists,
  setPage,
  setCurrentPage,
  selectCurrentPageEntities,
  deleteAllPages,
  selectCurrentPage,
} from '@ngneat/elf-pagination';

import { initState, MovieState, MovieItem, Pagination, MovieStore, StoreSelector } from './movies.model';
import { computeFilteredMovies } from './movies.filters';

/**
 * AutoFreeze store state
 */
elfHooks.registerPreStoreUpdate((currentState, nextState) => {
  return deepFreeze(nextState);
});

/**
 * Create store and streams for movies$, status$, and state$
 * Note: state$ includes computed properties and pagination
 */
const _store = createStore({ name: 'movie' }, withProps<MovieState>(initState()), withEntities<MovieItem>(), withPagination());

const movies$ = _store.pipe(selectCurrentPageEntities());
const status$ = _store.pipe(select((state) => state.status));
const state$ = _store.pipe(
  withLatestFrom(movies$),
  map(([state, allMovies]) => {
    return {
      ...state,
      allMovies,
      filteredMovies: computeFilteredMovies(allMovies, state.filterBy),
      pagination: _store.query(getPaginationData()),
    };
  })
);

/**********************************************
 * Store Methods
 **********************************************/

/**
 * Set cache and page information for remote search
 */
function updateMovies(movies: MovieItem[], paging: Partial<Pagination>, searchBy?: string) {
  const hasSearchBy = searchBy !== undefined && searchBy !== null;
  const clearCache = hasSearchBy ? _store.query((s) => s.searchBy) !== searchBy : false;
  const pagination = { ..._store.query(getPaginationData()), ...paging };
  const updateSearchBy = (state) => ({
    ...state,
    searchBy: hasSearchBy ? searchBy : state.searchBy,
  });

  emitOnce(() => {
    if (clearCache) {
      // If the searchBy criteria changes clear ALL cache!
      _store.update(deleteAllPages());
      _store.update(deleteAllEntities());

      // Make sure we clear old pages (if present)
      delete pagination.pages;
    }
    _store.update(
      updateSearchBy,
      upsertEntities(movies),
      updatePaginationData(pagination),
      setPage(
        pagination.currentPage,
        movies.map((it) => it.id)
      ),
      setCurrentPage(paging.currentPage)
    );
  });
}

function updateFilter(filterBy?: string) {
  _store.update((state) => ({
    ...state,
    filterBy: filterBy || '',
  }));
}

/**
 * Query support for snapshots of current internal store state...
 */
function useQuery<T extends unknown>(selector: StoreSelector<T>): T {
  return _store.query<T>(selector);
}

/**********************************************
 * Pagination Methods
 **********************************************/

function pageInRange(page: number): boolean {
  const { lastPage, total } = _store.query(getPaginationData());
  return total < 1 ? false : page > 0 && page <= lastPage;
}

function hasPage(page: number): boolean {
  return _store.query(pageExists(page));
}

function selectPage(page: number): boolean {
  const found = hasPage(page);
  found && _store.update(setCurrentPage(page));

  return found;
}

/**
 * Add page of movies WITHOUT changing active page or pagination information
 */
function addPage(movies: MovieItem[], page: number) {
  if (movies.length) {
    if (!pageInRange(page)) {
      const { total } = _store.query(getPaginationData());
      throw new Error(`addPage(${page}) is out of 0-${total} range`);
    }

    _store.update(
      upsertEntities(movies),
      setPage(
        page,
        movies.map((it) => it.id)
      )
    );
  }
}

/**********************************************
 * Export MovieStore instance
 **********************************************/

/**
 * Publish specific API that is useful/intuitive to Facades, etc.
 * This effectively creates proxies to internal store
 */
export const store: MovieStore = {
  state$,
  status$,

  updateMovies,
  updateFilter,
  useQuery,

  selectPage,
  hasPage,
  pageInRange,
  addPage,

  reset: _store.reset.bind(_store),
};
