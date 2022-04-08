import { Injectable } from '@angular/core';

import { produce } from 'immer';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { buildMatchIndicator, computeFilteredMovies } from './movies.filters';
import { MoviesDataService } from './movies.data-service';
import {
  initState,
  MovieItem,
  MovieState,
  MovieViewModel,
} from './movies.model';

/**
 * Load movies and cache results for similar future calls.
 * Architecture:
 *
 */

@Injectable()
export class MoviesFacade {
  private state: MovieState;
  private _emitter: BehaviorSubject<MovieState>;
  public vm$: Observable<MovieViewModel>;

  constructor(private movieAPI: MoviesDataService) {
    const state = initState();
    const api = {
      loadMovies: (searchBy: string) => this.loadMovies(searchBy),
      updateFilter: (filterBy: string) => this.updateFilter(filterBy),
      clearFilter: () => this.updateFilter(''),
    };
    const addAPI = (s: MovieState): MovieViewModel =>
      produce<MovieState>(this.state, (s: MovieState): MovieViewModel => {
        return { ...s, ...api };
      }) as MovieViewModel;

    this.state = state;
    this._emitter = new BehaviorSubject<MovieState>(state);
    this.vm$ = this._emitter.asObservable().pipe(map(addAPI));

    this.loadMovies(state.searchBy);
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   */
  loadMovies(searchBy: string, page = 1): Observable<MovieState> {
    this.movieAPI.searchMovies(searchBy, page).subscribe((list: unknown) => {
      const allMovies = list as MovieItem[];
      this.state = produce(this.state, (draft: MovieState) => {
        draft.allMovies = allMovies;
        draft.searchBy = searchBy;
      });
      this.updateFilter(this.state.filterBy);
    });

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string) {
    const state = { ...this.state, filterBy };
    const movies = computeFilteredMovies(state);
    const addMatchIndicators = buildMatchIndicator(filterBy);

    this.state = produce(this.state, (draft: MovieState) => {
      draft.filteredMovies = addMatchIndicators(movies);
      draft.filterBy = filterBy || '';
    });

    this._emitter.next(this.state);

    return this.vm$;
  }
}
