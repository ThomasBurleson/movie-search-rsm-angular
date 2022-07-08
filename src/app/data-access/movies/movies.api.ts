import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Pagination, MovieItem } from './movies.model';

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
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MDMwNTJkZWRmMGJkOGViODk2OWEzYWJkMzE2YjQ3NCIsInN1YiI6IjYyMGYwYzQxM2Y0ODMzMDA0NDYzNTdkYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9H4bwPC-X6VN-YZ-HGX5ynw5alHJxuvnlNTypol67VU',
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
}

/**
 * Extract list + pagination info from server response
 */
export function buildResponseFor(page = 1) {
  return function buildPaginatedResponses(data: RemoteMovieResponse): PaginatedMovieResponse {
    const pagination: Pagination = {
      currentPage: page,
      total: data.total_results,
      lastPage: data.total_pages,
      perPage: data.results.length,
    };
    return {
      pagination,
      list: data['results'],
    };
  };
}
