import { Input, Component, ChangeDetectionStrategy } from '@angular/core';

import { MovieItem } from '../../data-access';

@Component({
  selector: 'movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCard {
  @Input() movie: MovieItem;
  @Input() tags: string[];
}
