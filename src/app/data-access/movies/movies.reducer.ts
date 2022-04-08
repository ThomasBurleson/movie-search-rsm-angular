import { produce } from 'immer';

import { MovieState, MovieItem } from './movies.model';
import { buildMatchIndicator, computeFilteredMovies } from './movies.filters';

interface Action {
  type: string;
}

/**
 * Events with `On` prefix signify activity that happens AFTER
 * server responds [with data]. The server performs a search for a "searchMovie"
 * action and then a "onSearchMovie" action is dispatched to update the state with the results
 */
interface OnSearchMovieAction extends Action {
  type: 'onSearchMovies';
  searchBy: string;
  allMovies: MovieItem[];
}

interface UpdateFilterAction extends Action {
  type: 'updateFilter';
  filterBy: string;
}

// Redux/Ngrx-like ActionCreator functions

export const actions = {
  onSearchMovies(
    searchBy: string,
    allMovies: MovieItem[]
  ): OnSearchMovieAction {
    return { type: 'onSearchMovies', allMovies, searchBy };
  },

  updateFilter(filterBy: string): UpdateFilterAction {
    return { type: 'updateFilter', filterBy };
  },
};

// Redux/Ngrx-like Reducer functions

export type MovieAction = OnSearchMovieAction | UpdateFilterAction;

export function movieStateReducer(
  state: MovieState,
  action: MovieAction
): MovieState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'onSearchMovies':
        const { searchBy, allMovies } = action;
        draft.allMovies = allMovies;
        draft.searchBy = searchBy;
        break;
      case 'updateFilter':
        draft.filterBy = action.filterBy;
        break;
    }
    const movies = computeFilteredMovies(draft);
    const addMatchIndicators = buildMatchIndicator(draft.filterBy);

    draft.filteredMovies = addMatchIndicators(movies);
  });
}
