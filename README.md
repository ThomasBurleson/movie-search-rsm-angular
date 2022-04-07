# Degreed CodeLab - Immutable Data w/ ImmerJS

This Angular SPA uses Tailwind CSS, Facades, Presentation components, and View Models to demonstrate the beauty and benefit of SoC in Angular. The app looks great, is responsive (try resizing the preview window), has animations, and is the actual STARTING point for **Challenge** improvements.

[![Open Stackblitz Demo](https://user-images.githubusercontent.com/210413/162355665-5c0d36cc-dd0d-4c95-beca-2d5b4e3cd21c.png)](https://stackblitz.com/edit/codelab-movies-search?file=README.md)

> [Open Stackblitz Demo](https://stackblitz.com/edit/codelab-movies-search?file=README.md)

## Why a CodeLab?

This CodeJam Lab is a starting point for developers to leverage their understandings of **Immutability with ImmerJS** and practice implementing those ideas using `concepts-to-practice` lab examples.

Developers are frequently encouraged to think about code isolation and separation of concerns [SoC] between UI and business logic. The Challenge improvements [in this CodeLab ] will be implemented deep **inside** the Business layer code with **no changes** to the UI layer.

### Running the CodeLab application:

- Open [online in Stackblitz](https://stackblitz.com/edit/codelab-movies-search)
- Run locally `npm i && npm start`

## ImmerJS Slides

[![Open SlideDeck](https://user-images.githubusercontent.com/210413/162356294-eae14ccf-45a4-413d-b3e5-d1019299d33a.png)](https://docs.google.com/presentation/d/16vtqUvu-bHmkWfbvzEZZ_-8YxFs0-h8luA3rYTr-kjU/edit?usp=sharing)

> [Open Slides](https://docs.google.com/presentation/d/16vtqUvu-bHmkWfbvzEZZ_-8YxFs0-h8luA3rYTr-kjU/edit?usp=sharing)

<br/>

---

<br/>

## Challenges

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
