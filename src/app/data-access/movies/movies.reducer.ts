import { MovieState } from './movies.model';

export interface MovieAction {
  type: 'searchBy' | 'clearFilter';
  payload?: string;
}

export function searchAction(searchBy: string): MovieAction {
  return { type: 'searchBy', payload: searchBy };
}

export function clearFilterAction(): MovieAction {
  return { type: 'clearFilter' };
}

export function moviesReducer(state: MovieState, action: MovieAction) {
  switch (action.type) {
    case 'searchBy':
      return state; // fixme
    case 'clearFilter':
      return state; // fixme
  }
  return state;
}
