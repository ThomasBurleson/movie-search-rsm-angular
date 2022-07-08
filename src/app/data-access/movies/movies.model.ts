import { Observable } from 'rxjs';
import { PaginationData } from '@ngneat/elf-pagination';

export type Pagination = PaginationData;
export interface MovieItem extends Record<string, any> {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
}

export type MovieStatus = 'busy' | 'done' | 'failed';
export const trackByID = (m: MovieItem) => m.poster_path;

/**
 * This state is serializable
 */
export interface MovieState {
  searchBy: string;
  filterBy: string;
  allMovies: MovieItem[];
  status?: MovieStatus;
  pagination: Pagination;
}

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  searchMovies: (searchBy: string) => void;
  showPage: (page: number) => void;
  clearFilter: () => void;
}

/**
 * This is runtime 'extra' view model state
 * that includes 'filteredMovies' since we do not
 * want that serialized.
 */
export interface MovieComputedState {
  filteredMovies: MovieItem[];
}

export function initState(): MovieState {
  return {
    searchBy: 'dogs',
    filterBy: '',
    allMovies: [],
    pagination: {} as Pagination,
  };
}

/**********************************************
 * Store API published for use by the Facade
 **********************************************/

export type StoreSelector<T extends unknown> = (s: MovieState) => T;

export interface MovieStore {
  state$: Observable<MovieState & MovieComputedState>;
  status$: Observable<MovieStatus>;

  updateMovies: (movies: MovieItem[], page: Pagination, searchBy?: string) => void;
  updateFilter: (filterBy?: string) => void;
  useQuery: <T extends unknown>(selector: StoreSelector<T>) => T;
  reset: () => void;

  selectPage: (page: number) => boolean;
  addPage: (movies: MovieItem[], page: number) => void;
  hasPage: (page: number) => boolean;
  pageInRange: (page: number) => boolean;
}

/**********************************************
 * ViewModel published to UI layers (from Facade)
 **********************************************/

export type MovieViewModel = MovieState & MovieComputedState & MovieAPI;
