import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

import { PAGES } from './movies.data';
import { PaginatedMovieResponse } from '../../movies.api';

/** A trivial data layer service that requests movies from a movie database API */
@Injectable()
export class MoviesDataService {
  searchMovies(query: string, page: number): Observable<PaginatedMovieResponse> {
    return of(PAGES[page - 1]);
  }
}
