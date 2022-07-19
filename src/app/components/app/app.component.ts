import { Observable } from 'rxjs';
import { Component, TrackByFunction } from '@angular/core';

import { MovieItem, MovieViewModel, MoviesFacade } from '../../data-access';

const findMovieId: TrackByFunction<MovieItem> = (i: number, m: MovieItem) => m.poster_path;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  trackByKey = findMovieId;
  highlightedGenres: number[];

  vm$: Observable<MovieViewModel> = this.facade.vm$;

  constructor(private facade: MoviesFacade) {}
}
