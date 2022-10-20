export interface MovieItem {
  title: string;
  overview: string;
  poster_path: string;
}

export const trackByID = (m: MovieItem) => m.poster_path;

/**
 * This state is serializable
 */
export interface MovieState {
  searchBy: string;
  filterBy: string;
  allMovies: MovieItem[];
  filteredMovies?: MovieItem[];
}

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  loadMovies: (searchBy: string, page?: number) => void;
  clearFilter: () => void;
}

export function initState(): MovieState {
  return {
    searchBy: 'dogs',
    allMovies: [],
    filterBy: '',
    filteredMovies: [],
  };
}

export type MovieViewModel = MovieState & MovieAPI;
