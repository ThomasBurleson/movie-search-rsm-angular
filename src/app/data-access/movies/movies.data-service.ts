import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pluck } from 'rxjs';

/** A trivial data layer service that requests movies from a movie database API */
@Injectable()
export class MoviesDataService {
  constructor(private httpClient: HttpClient) {}

  searchByAuthor<TResult extends unknown>(
    term: string,
    date: string,
    author: string
  ) {
    term = `${term}&date=${date}&author=${author}`;
    return this.searchMovies<TResult>(term, 1);
  }

  searchMovies<TResult extends unknown>(term: string, page: number) {
    const params = {
      params: { query: term, page: page + 1 },
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MDMwNTJkZWRmMGJkOGViODk2OWEzYWJkMzE2YjQ3NCIsInN1YiI6IjYyMGYwYzQxM2Y0ODMzMDA0NDYzNTdkYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9H4bwPC-X6VN-YZ-HGX5ynw5alHJxuvnlNTypol67VU',
        'Content-Type': 'application/json;charset=utf-8',
      },
    };
    const request$ = this.httpClient.get<{ results: TResult }>(
      'https://api.themoviedb.org/4/search/movie',
      params
    );

    return request$.pipe(pluck('results'));
  }
}
