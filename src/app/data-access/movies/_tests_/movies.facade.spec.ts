import { CommonModule } from '@angular/common';
import { async, TestBed } from '@angular/core/testing';

import { MoviesDataService as MockMoviesAPI } from './_mocks';
import { readFirst, Selector } from '../../utils';

import { MovieState } from './../movies.model';
import { MoviesFacade } from '../movies.facade';
import { MoviesDataService } from '../movies.api';

describe('MoviesFacade', () => {
  let facade: MoviesFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [{ provide: MoviesDataService, useClass: MockMoviesAPI }, MoviesFacade],
    });

    facade = TestBed.inject(MoviesFacade);
  });

  it('instantiate', () => {
    expect(facade).toBeTruthy();
    expect(facade).toHaveObservables(['vm$', 'status$']);
    expect(facade).toHaveMethods(['loadMovies', 'updateFilter', 'showPage']);
  });

  it('should auto-load movies for "dogs"', () => {
    expect(facade.vm$).toEmit(4, (s: MovieState) => s.allMovies.length);
    expect(facade.vm$).toEmit(1, (s: MovieState) => s.pagination.currentPage);
  });

  it('should updateFilter and emit value from vm$', () => {
    const filterBy = 'furry';
    facade.updateFilter(filterBy);
    expect(facade.vm$).toEmit(filterBy, (s: MovieState) => s.filterBy);
  });

  describe('loadMovies', () => {
    const findSearchBy = (s: MovieState): string => s.searchBy;
    const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
    const findNumPages = (s: MovieState): number => Object.keys(s.pagination['pages']).length;

    it('should prefretch page 2 during autoload', () => {
      expect(facade.vm$).toEmit(2, findNumPages);
    });

    it('should prefretch next pages with using same "searchBy"', () => {
      const searchBy = readFirst(facade.vm$, findSearchBy);

      facade.loadMovies(searchBy, 2);
      expect(facade.vm$).toEmit(2, findCurrentPage);

      facade.loadMovies(searchBy, 3);
      expect(facade.vm$).toEmit(3, findCurrentPage);
    });

    it('should load more pages with using same "searchBy"', () => {
      const searchBy = readFirst(facade.vm$, findSearchBy);

      facade.loadMovies(searchBy, 2);
      expect(facade.vm$).toEmit(2, findCurrentPage);

      facade.loadMovies(searchBy, 3);
      expect(facade.vm$).toEmit(3, findCurrentPage);
    });
  });

  it('showPage() with same searchBy should and emit list', () => {
    const findSearchBy = (s: MovieState): string => s.searchBy;
    const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
    const searchBy = readFirst(facade.vm$, findSearchBy);

    facade.loadMovies(searchBy, 2);
    expect(facade.vm$).toEmit(2, findCurrentPage);

    facade.showPage(1);
    expect(facade.vm$).toEmit(1, findCurrentPage);

    facade.showPage(3);
    expect(facade.vm$).toEmit(3, findCurrentPage);
  });
});
