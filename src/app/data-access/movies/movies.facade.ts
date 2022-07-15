import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { SelectableList, SelectableListVM } from './../utils/selectable-list';

import { MovieStore } from './movies.store';
import { useFilterByGenre } from './movies.filters';
import { MoviesDataService, PaginatedMovieResponse } from './movies.api';
import { MovieState, MovieComputedState, MovieGenreState, StatusState, MovieGenre } from './movies.model';

/**********************************************
 * ViewModel published to UI layers (from Facade)
 **********************************************/

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  searchMovies: (searchBy: string) => void;
  selectGenresById: (selectedIDs: string[]) => void;
  showPage: (page: number) => void;
  clearFilter: () => void;
}

export type MovieViewModel = MovieState & MovieComputedState & MovieGenreState & MovieAPI;

/**
 * Load movies and cache results for similar future calls.
 *
 * Reactive Architecture:
 *       UI <-> ViewModel <-> Facade <-> Store
 *                                 |-->  DataService
 */
@Injectable()
export class MoviesFacade {
  public vm$: Observable<MovieViewModel>;
  public status$: Observable<StatusState>;
  public isLoading$: Observable<boolean>;

  private _genre: SelectableList<MovieGenre>;

  constructor(private _store: MovieStore, private _api: MoviesDataService) {
    const searchBy = _store.useQuery((s) => s.searchBy);

    // We manage this directly BECAUSE 'genre' store 'selected' changes filter
    // the movies shown/visible.
    this._genre = new SelectableList<MovieGenre>('genres');

    this.status$ = _store.status$; // may contain error informatoin
    this.isLoading$ = _store.isLoading$.pipe(tap((busy) => console.log(`isLoading = ${busy}`)));
    this.vm$ = combineLatest([_store.state$, this._genre.vm$]).pipe(map(this.addViewModelAPI.bind(this)));

    // Load initial movies based on default state values
    this.loadGenres();
    this.loadMovies(searchBy);
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   * Also smart prefetch next page...
   */
  loadMovies(searchBy: string, page = 1): Observable<MovieViewModel> {
    if (!!searchBy) {
      this._store.setLoading(true);

      this._api
        .searchMovies(searchBy, page)
        .pipe(this._store.trackLoadStatus)
        .subscribe((response: PaginatedMovieResponse) => {
          const { list, pagination } = response;
          this._store.updateMovies(list, pagination, searchBy);
          this.prefetchPage(searchBy, page + 1);
          // reset to idle
          this._store.setLoading(false);
        });
    }

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string): Observable<MovieViewModel> {
    this._store.updateFilter(filterBy);
    return this.vm$;
  }

  // *******************************************************
  // Genre features
  // *******************************************************

  /**
   * Load list of all movie genres
   * @see `vm.genres` or `store.state$.genres`
   */
  loadGenres(): Observable<SelectableListVM<MovieGenre>> {
    this._api
      .loadGenres()
      .pipe(this._genre.trackLoadStatus)
      .subscribe((list: MovieGenre[]) => {
        this._genre.addItems(list, true);
      });
    return this._genre.vm$;
  }

  selectGenresById(selectedIds: string[], clearOthers = true): Observable<SelectableListVM<MovieGenre>> {
    this._genre.selectItemsById(selectedIds, clearOthers);
    return this._genre.vm$;
  }

  // *******************************************************
  // Pagination Methods
  // *******************************************************

  /**
   * Show movies at page #... load if not in cache already
   * Always try to prefetch next page from 'selected'
   */
  showPage(page = 1): Observable<MovieViewModel> {
    const searchBy = this._store.useQuery((s) => s.searchBy);

    if (this._store.pageInRange(page)) {
      const fromCache = this._store.selectPage(page);

      if (fromCache && !this._store.hasPage(page + 1)) {
        this.prefetchPage(searchBy, page + 1);
      }
      return fromCache ? this.vm$ : this.loadMovies(searchBy, page);
    }

    return this.vm$;
  }

  // *******************************************************
  // Private Methods
  // *******************************************************

  /**
   * Background prefetch for super-fast page navigation rendering
   * NOTE: do not update status for background prefetching
   */
  private prefetchPage(searchBy: string, page: number) {
    if (this._store.pageInRange(page)) {
      const request$ = this._api.searchMovies(searchBy, page);
      request$.subscribe(({ list }: PaginatedMovieResponse) => {
        this._store.addPage(list, page);
      });
    }
  }

  /**
   * Inject the Facade combineLatest
   * proxy API into view model
   */

  private addViewModelAPI([state, genres]: [MovieState & MovieComputedState, SelectableListVM<MovieGenre>]): MovieViewModel {
    const selectedIDs = genres.selected.map((it) => it.id);
    const api = {
      searchMovies: this.loadMovies.bind(this),
      selectGenresById: this.selectGenresById.bind(this),
      clearFilter: () => this.updateFilter(''),
      updateFilter: this.updateFilter.bind(this),
      showPage: this.showPage.bind(this),
    };

    // Movies aviailable are [by default] based on 'filterBy' criteria
    // Now let's add an extra filter based on selected Genres
    const filteredMovies = useFilterByGenre(state.filteredMovies, selectedIDs);

    return {
      ...state,
      ...api,
      genres,
      filteredMovies,
    };
  }
}
