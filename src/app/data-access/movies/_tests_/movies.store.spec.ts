import { first } from 'rxjs/operators';

import { PAGES } from './_mocks/movies.data';
import { store } from '../movies.store'; // not exported from index.ts

import { MovieState } from './../';

jest.useFakeTimers();

describe('MovieStore', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('initialization', () => {
    it('should have public properties', () => {
      expect(store).toBeTruthy();
      expect(store).toHaveObservables(['state$', 'status$']);
    });

    it('should have API', () => {
      expect(store).toBeTruthy();

      expect(store).toHaveMethods(['updateMovies', 'updateFilter', 'useQuery']);
      expect(store).toHaveMethods(['selectPage', 'hasPage', 'pageInRange', 'addPage']);
    });

    it('should initialize with correct state', () => {
      const state = store.useQuery((s) => s);
      const { searchBy, filterBy, allMovies } = state;

      expect(searchBy).toBe('dogs'); // Default startup value for the movie search
      expect(filterBy).toBe('');
      expect(allMovies).toEqual([]);

      // Do the emitted stream values match the snapshot values?
      const state$ = store.state$.pipe(first());
      state$.subscribe((s: MovieState) => {
        expect(s.searchBy).toEqual(searchBy);
        expect(s.filterBy).toBe(filterBy);
        expect(s.allMovies).toEqual(allMovies);
      });
    });

    it('should have pagination with 0 page', () => {
      const state$ = store.state$.pipe(first());
      state$.subscribe(({ pagination }: MovieState) => {
        expect(store.hasPage(1)).toBeFalsy();

        expect(pagination).toBeDefined();
        expect(pagination.currentPage).toBe(0);
        expect(pagination.total).toBe(0);
        expect(pagination.perPage).toBe(0);
        expect(pagination.lastPage).toBe(0);
      });
    });

    it('should have pagination actions report fail', () => {
      expect(store.selectPage(1)).toBe(false);
      expect(store.selectPage(2)).toBe(false);

      expect(store.hasPage(1)).toBe(false);
      expect(store.hasPage(2)).toBe(false);

      expect(store.pageInRange(1)).toBe(false);
      expect(store.pageInRange(2)).toBe(false);
    });
  });

  describe('updateMovides', () => {
    it('should update search and allMovies', () => {
      const findSearchCriteria = (s: MovieState) => s.searchBy;
      const findNumMoviesShown = (s: MovieState) => s.allMovies.length;
      const findNumMoviesAvailable = (s: MovieState) => s.pagination.total;
      const findCurrentPage = (s: MovieState) => s.pagination.currentPage;

      const page1 = PAGES[0];
      const page2 = PAGES[1];

      expect(page2.pagination.currentPage).not.toBe(page1.pagination.currentPage);

      // Add 1st page
      store.updateMovies(page1.list, page1.pagination, 'canine');

      expect(store.state$).toEmit('canine', findSearchCriteria);
      expect(store.state$).toEmit(page1.list.length, findNumMoviesShown);
      expect(store.state$).toEmit(page1.pagination.total, findNumMoviesAvailable);
      expect(store.state$).toEmit(page1.pagination.currentPage, findCurrentPage);

      // Add 2nd page
      store.updateMovies(page2.list, page2.pagination, 'canine');

      expect(store.state$).toEmit('canine', findSearchCriteria);
      expect(store.state$).toEmit(page2.list.length, findNumMoviesShown);
      expect(store.state$).toEmit(page2.pagination.total, findNumMoviesAvailable);
      expect(store.state$).toEmit(page2.pagination.currentPage, findCurrentPage);

      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      // Adding page auto-selects that page
      // Expect currentPage to be emitted as #2
      expect(store.state$).toEmit(2, findCurrentPage);
    });

    it('should clear all pages when the search criteria changes', () => {
      const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
      const findSearchCriteria = (s: MovieState) => s.searchBy;

      [0, 1].map((i) => store.updateMovies(PAGES[i].list, PAGES[i].pagination, 'dogs'));
      expect(store.useQuery(findSearchCriteria)).toBe('dogs');
      expect(store.state$).toEmit(2, findCurrentPage);
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);

      // Add movies with NEW search criteria
      store.updateMovies(PAGES[0].list, PAGES[0].pagination, 'snakes');

      expect(store.useQuery(findSearchCriteria)).toBe('snakes');
      expect(store.state$).toEmit(1, findCurrentPage);
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(false);
    });
  });

  describe('filterBy', () => {
    const selectFilterBy = (s: MovieState) => s.filterBy;
    expect(store.useQuery(selectFilterBy)).toBe('');

    const filterBy = 'siberian';
    store.updateFilter(filterBy);
    expect(store.useQuery(selectFilterBy)).toBe('siberian');
    expect(store.state$).toEmit(filterBy, selectFilterBy);

    store.reset();
    expect(store.useQuery(selectFilterBy)).toBe('');
    expect(store.state$).toEmit('', selectFilterBy);
  });

  describe('pagination', () => {
    const findCurrentPage = (s: MovieState) => s.pagination.currentPage;

    beforeEach(() => {
      // Populate store with 2 pages of data
      [0, 1].map((i) => {
        store.updateMovies(PAGES[i].list, PAGES[i].pagination, 'dogs');
      });
    });

    it('should report pages correctly', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);
      expect(store.hasPage(4)).toBe(false);

      expect(store.state$).toEmit(2, findCurrentPage);
      expect(store.selectPage(2)).toBe(true);
    });

    it('should addPage without changing currentPage', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      expect(store.state$).toEmit(2, findCurrentPage);

      store.addPage(PAGES[2].list, 3);
      expect(store.hasPage(3)).toBe(true);
      expect(store.state$).toEmit(2, findCurrentPage);

      store.selectPage(1);
      expect(store.state$).toEmit(1, findCurrentPage);

      store.addPage(PAGES[3].list, 4);
      expect(store.hasPage(4)).toBe(true);
      expect(store.state$).toEmit(1, findCurrentPage);
    });

    it('addPage should throw error for invalid page numbers', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      let errorMsg = '';
      try {
        // Note: pagination informatio (with total pages) is
        // set in updateMovies() or
        store.addPage(PAGES[2].list, 57);
      } catch (e) {
        errorMsg = e;
      }
      expect(errorMsg).not.toBe('');
    });

    it('addPage shoud not add page with empty list', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      store.addPage([], 3);
      expect(store.hasPage(3)).toBe(false);
    });

    it('should selectPage correctly', () => {
      expect(store.state$).toEmit(2, findCurrentPage);

      expect(store.selectPage(1)).toBe(true);
      expect(store.state$).toEmit(1, findCurrentPage);
    });
  });
});
