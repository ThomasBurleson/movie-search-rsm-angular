export interface MovieItem {
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
}

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  loadMovies: (searchBy: string) => void;
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
  };
}

export type MovieViewModel = MovieState & MovieComputedState & MovieAPI;
