import { PaginationData } from '@ngneat/elf-pagination';
import { StatusState } from '@ngneat/elf-requests';

import { Pagination, SelectableListVM } from '../utils';

export interface MovieItem extends Record<string, any> {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  genre_ids: number[];
}

export interface MovieGenre {
  id: string;
  name: string;
}

/**
 * Uniquely identify Movie in *ngFor loops
 */
export const trackByID = (m: MovieItem) => m.poster_path;

/**
 * This state is serializable
 */
export interface MovieState {
  searchBy: string;
  filterBy: string;
  allMovies: MovieItem[];
  pagination: Pagination;
}

/**
 * This is runtime 'extra' view model state
 * that includes 'filteredMovies' since we do not
 * want that serialized.
 */
export interface MovieComputedState {
  filteredMovies: MovieItem[];
}

export interface MovieGenreState {
  genres: SelectableListVM<MovieGenre>;
}

export function initState(): MovieState {
  return {
    searchBy: 'dogs',
    filterBy: '',
    allMovies: [],
    pagination: {} as Pagination,
  };
}
