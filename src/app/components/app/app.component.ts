import { Observable } from 'rxjs';
import { Component, TrackByFunction } from '@angular/core';

import { MovieItem, MovieViewModel, MoviesFacade } from '../../data-access';
import { listAnimation, fadeAnimation } from '../movie-card';

const findMovieId: TrackByFunction<MovieItem> = (i: number, m: MovieItem) =>
  m.poster_path;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  animations: [fadeAnimation, listAnimation],
})
export class AppComponent {
  trackByKey = findMovieId;
  vm$: Observable<MovieViewModel> = this.facade.vm$;

  constructor(private facade: MoviesFacade) {}
}
