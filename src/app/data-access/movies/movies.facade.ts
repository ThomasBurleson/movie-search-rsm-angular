import { Injectable } from '@angular/core';

import { freeze, produce } from 'immer';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MoviesDataService } from './movies.data-service';
import {
  initState,
  MovieItem,
  MovieState,
  MovieViewModel,
} from './movies.model';
import { movieStateReducer, actions } from './movies.reducer';

/**
 * Load movies and cache results for similar future calls.j
 * Architecture:
 *
 */

@Injectable()
export class MoviesFacade {
  private state: MovieState = freeze(initState(), true);
  private _emitter: BehaviorSubject<MovieState>;
  public vm$: Observable<MovieViewModel>;

  constructor(private movieAPI: MoviesDataService) {
    const api = {
      loadMovies: (searchBy: string) => this.loadMovies(searchBy),
      updateFilter: (filterBy: string) => this.updateFilter(filterBy),
      clearFilter: () => this.updateFilter(''),
    };
    const addAPI = (s: MovieState): MovieViewModel => {
      return produce<MovieState>(
        this.state,
        (s: MovieState): MovieViewModel => {
          return { ...s, ...api };
        }
      ) as MovieViewModel;
    };

    this._emitter = new BehaviorSubject<MovieState>(this.state);
    this.vm$ = this._emitter.asObservable().pipe(map(addAPI));

    this.loadMovies(this.state.searchBy);
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   */
  loadMovies(searchBy: string, page = 1): Observable<MovieState> {
    this.movieAPI
      .searchMovies<MovieItem[]>(searchBy, page)
      .subscribe((list: MovieItem[]) => {
        const allMovies = list as MovieItem[];

        this.state = movieStateReducer(
          this.state,
          actions.onSearchMovies(searchBy, allMovies)
        );
        this._emitter.next(this.state);
      });

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string) {
    this.state = movieStateReducer(this.state, actions.updateFilter(filterBy));
    this._emitter.next(this.state);

    return this.vm$;
  }
}
