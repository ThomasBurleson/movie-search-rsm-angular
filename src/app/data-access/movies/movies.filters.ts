import { MovieItem, MovieState } from './movies.model';

const contentHasMatch = (filterBy: string) => {
  filterBy = filterBy.toLowerCase();
  return ({ title, overview }: MovieItem) => {
    const foundInTitle = title.toLowerCase().indexOf(filterBy) > -1;
    const foundInOverview = overview.toLowerCase().indexOf(filterBy) > -1;

    return !filterBy ? true : foundInTitle || foundInOverview;
  };
};

/**
 * Why are computed properties valuable, calculated on-demand
 * and NOT serialized.
 */
export function computeFilteredMovies(
  allMovies: MovieItem[],
  filterBy: string
): MovieItem[] {
  const movies = useFilterBy(allMovies, filterBy);
  const addMatchIndicators = buildMatchIndicator(filterBy);

  return addMatchIndicators(movies);
}

// Create a filter function
export function useFilterBy(
  allMovies: MovieItem[],
  filterBy: string
): MovieItem[] {
  const hasMatches = contentHasMatch(filterBy);
  return allMovies.filter(hasMatches).map((m) => ({ ...m }));
}

/**
 * For the specified filter, find all matches in all movie overviews
 */
export const buildMatchIndicator =
  (filterBy: string | undefined) =>
  (source: MovieItem[]): MovieItem[] => {
    const matchIn = (s: string) =>
      filterBy
        ? s.replace(
            new RegExp(filterBy, 'gi'),
            (match) => `<span class='match'>${match}</span>`
          )
        : s;

    return source.map((m) => ({
      ...m,
      title: matchIn(m.title),
      overview: matchIn(m.overview),
    }));
  };
