import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pluck, tap } from 'rxjs';

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
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzUwN2ZiYmVkN2JkMjBiZTg3MTNjMTAyMTdiNDRlNCIsInN1YiI6IjYyY2YyNzhjNmRjNTA3MDA1NDY3ZGM3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gNrKzUpRaTHGeiKBTW_rAfq-HMy21rmxJiCBvrBllfY',
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
