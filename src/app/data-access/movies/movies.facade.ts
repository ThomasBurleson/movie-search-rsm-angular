import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MoviesDataService, PaginatedMovieResponse } from './movies.api';
import { computeFilteredMovies } from './movies.filters';
import { MovieState, MovieComputedState, MovieViewModel, MovieStatus } from './movies.model';
import { store } from './movies.store';

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
  public status$: Observable<MovieStatus>;

  constructor(private movieAPI: MoviesDataService) {
    const searchBy = store.useQuery((s) => s.searchBy);

    this.status$ = store.status$;
    this.vm$ = store.state$.pipe(map(this.addViewModelAPI.bind(this)));

    // Load initial movies based on default state values
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
      const request$ = this.movieAPI.searchMovies(searchBy, page);
      const onLoaded = (response: PaginatedMovieResponse) => {
        const { list, pagination } = response;
        store.updateMovies(list, pagination, searchBy);
        this.prefetchPage(searchBy, page + 1);
      };

      request$.subscribe(onLoaded);
    }

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string): Observable<MovieViewModel> {
    store.updateFilter(filterBy);
    return this.vm$;
  }

  // *******************************************************
  // Pagination Methods
  // *******************************************************

  /**
   * Show movies at page #... load if not in cache already
   * Always try to prefetch next page from 'selected'
   */
  showPage(page = 1): Observable<MovieViewModel> {
    const searchBy = store.useQuery((s) => s.searchBy);

    if (store.pageInRange(page)) {
      const fromCache = store.selectPage(page);

      if (fromCache && !store.hasPage(page + 1)) {
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
   */
  private prefetchPage(searchBy: string, page: number) {
    if (store.pageInRange(page)) {
      const request$ = this.movieAPI.searchMovies(searchBy, page);
      request$.subscribe(({ list }: PaginatedMovieResponse) => {
        store.addPage(list, page);
      });
    }
  }

  /**
   * Inject the Facade proxy API into published view model
   */
  private addViewModelAPI(state: MovieState & MovieComputedState): MovieViewModel {
    const api = {
      searchMovies: this.loadMovies.bind(this),
      updateFilter: this.updateFilter.bind(this),
      showPage: this.showPage.bind(this),

      clearFilter: () => this.updateFilter(''),
    };
    return {
      ...state,
      ...api,
    };
  }
}
