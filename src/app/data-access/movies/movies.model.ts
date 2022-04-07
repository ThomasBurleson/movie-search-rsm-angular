export interface MovieItem {
  title: string;
  overview: string;
  poster_path: string;
}

export const trackByID = (m: MovieItem) => m.poster_path;

export interface MovieState {
  allMovies: MovieItem[];
  filteredMovies: MovieItem[];
  searchBy: string;
  filterBy: string;
}

export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  loadMovies: (searchBy: string) => void;
  clearFilter: () => void;
}

export function initState(): MovieState {
  return {
    allMovies: [],
    filteredMovies: [],
    searchBy: 'dogs',
    filterBy: '',
  };
}

export type MovieViewModel = MovieState & MovieAPI;
