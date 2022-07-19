import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pagination } from '../utils';
import { MovieItem, MovieGenre } from './movies.model';

// Formatted response for business layers
export interface PaginatedMovieResponse {
  list: MovieItem[];
  pagination: Pagination;
}

// Response from remote endpoint
export interface RemoteMovieResponse {
  page: number;
  results: MovieItem[];
  total_pages: number;
  total_results: number;
}

const HEADERS_MOVIEDB = {
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzUwN2ZiYmVkN2JkMjBiZTg3MTNjMTAyMTdiNDRlNCIsInN1YiI6IjYyY2YyNzhjNmRjNTA3MDA1NDY3ZGM3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gNrKzUpRaTHGeiKBTW_rAfq-HMy21rmxJiCBvrBllfY',
  'Content-Type': 'application/json;charset=utf-8',
};

/** A trivial data layer service that requests movies from a movie database API */
@Injectable()
export class MoviesDataService {
  constructor(private httpClient: HttpClient) {}

  searchByAuthor(term: string, date: string, author: string) {
    term = `${term}&date=${date}&author=${author}`;
    return this.searchMovies(term, 1);
  }

  searchMovies(query: string, page: number): Observable<PaginatedMovieResponse> {
    const params = { params: { query, page }, headers: HEADERS_MOVIEDB };
    const request$ = this.httpClient.get<RemoteMovieResponse>('https://api.themoviedb.org/4/search/movie', params);

    return request$.pipe(map(buildResponseFor(page))); // return 'results' + pagination information
  }

  /**
   * List of all movie Genres
   * @returns
   */
  loadGenres(): Observable<MovieGenre[]> {
    const url = 'https://api.themoviedb.org/3/genre/movie/list?api_key=13507fbbed7bd20be8713c10217b44e4&language=en-US';
    const request$ = this.httpClient.get<RemoteMovieResponse>(url);

    return request$.pipe(
      map((response) => response['genres']),
      map((list) => {
        // convert all 'id' values to strings;
        return list.map((it) => ({ ...it, id: String(it.id) }));
      })
    );
  }
}

/**
 * Extract list + pagination info from server response
 */
export function buildResponseFor(page = 1) {
  return function buildPaginatedResponses(data: RemoteMovieResponse): PaginatedMovieResponse {
    const start = (page - 1) * data.results.length;
    const end = Math.min(start + data.results.length, data.total_results);

    const pagination: Pagination = {
      currentPage: page,
      total: data.total_results,
      lastPage: data.total_pages,
      perPage: data.results.length,
      start,
      end,
    };
    return {
      pagination,
      list: data['results'],
    };
  };
}
