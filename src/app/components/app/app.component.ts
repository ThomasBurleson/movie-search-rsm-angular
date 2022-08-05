import { Component, TrackByFunction } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { MovieItem, MovieViewModel, MoviesFacade } from '../../data-access';

const findMovieId: TrackByFunction<MovieItem> = (i: number, m: MovieItem) => m.poster_path;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  trackByKey = findMovieId;
  highlightedGenres: number[];

  vm$: Observable<MovieViewModel>;

  constructor(private facade: MoviesFacade, private route: ActivatedRoute) {
    this.vm$ = this.facade.vm$;
    this.loadFromBookmark();
  }

  /**
   * Bookmarks: if the URL does not specify a searchBy, then auto-search for 'dogs'
   */
  private loadFromBookmark() {
    const hasParams = window.location.href.indexOf('searchBy=') > -1;

    if (hasParams) this.facade.loadFromRoute(this.route.queryParams);
    else this.facade.loadMovies('dogs');
  }
}
