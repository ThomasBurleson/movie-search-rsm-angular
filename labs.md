# Challenge Labs

The lab has four (4) challenges. All the improvements will be in `src/app/data-access/movies`:

Before you start on the Challenge exercises:

- Fork the Stackblitz Demo (if you are working online)
- Create a local git branch using `git checkout -B challenges`

<br/>

### (1) **Use `freeze()` for immutability**

Use `freeze()` to ensure data published from `MoviesFacade` is immutable.

###### `src/app/data-access/movies/movies.facade.ts`

```ts
import { freeze } from "immer";

// use freeze where needed.
// try to modify `facade.state` from the UI layer
```

> Question: what is important consideration with the `freeze()` api?

<br/>

### (2) **Use `produce()` with Immutable Data**

Use `produce()` to enable immutable data can be modified and refrozen:

###### `src/app/data-access/movies/movies.facade.ts`

```ts
  import { freeze, produce } from 'immer';

  loadMovies(searchBy: string, page = 1): Observable<MovieState> {
    this.movieAPI.searchMovies(searchBy, page).subscribe((list: unknown) => {
      const allMovies = list as MovieItem[];
      produce(this.state, (draft) => {

       //... code here

      });
    });

    return this.vm$;
  }

  updateFilter(filterBy?: string) {
     produce(this.state, (draft) => {

       //... code here

      });

    this._emitter.next(this.state);
    return this.vm$;
  }
```

> What is the critical consideration using `produce()`?

<br/>

### (3) **Centralize State Changes**

Centralize all state changes by using the _actions_ and `moviesReducer()` in the `src/app/data-access/movies.reducer/ts`

###### `src/app/data-access/movies/movies.facade.ts`

```ts
  import { freeze, produce } from 'immer';
  import { searchAction, moviesReducer } from './movies.reducer.ts';

  loadMovies(searchBy: string, page = 1): Observable<MovieState> {
    this.movieAPI.searchMovies(searchBy, page).subscribe((list: unknown) => {
      const allMovies = list as MovieItem[];
      this.state = moviesReducer(this.state, searchAction(searchBy));
    });

    return this.vm$;
  }
```

> You will need to update the logic in the Reducer. Don't forget to freeze your data and use `produce()` as required.

<br/>

### (4) **Use Computed Properties**

'Computed properties' are essential concepts when building push-based architectures. Computed properties are crucial for two (2) reasons:

- We do not want to serialize 'computed' properties
- Without a computed property, we can easily miss conditions when the property should be updated.

Change `filteredMovies` to be a computed property recalculated whenever the state changes.

- Use `computeFilteredMovies()` in `src/app/data-access/movies/movies.filters.ts` to calculate the `filteredMovies` list.
- Inject that property/value into the VM as it is streamed to external consumers/observers
- Modify `MovieState` to no longer have the `filteredMovies` property... move that to the `MovieViewModel` interface.
  > Hint: use a similar approach to `addAPI()` in MovieFacade.

Congratulations! You now are starting to use a HUGELY important concept: 'Computed Properties'

> Question: this current version is naive and presents performance issues. Can you describe why?
