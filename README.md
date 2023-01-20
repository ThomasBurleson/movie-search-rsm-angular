# Reactive Stores with Zustand (Angular SPA)

This Angular SPA uses Tailwind, Reactive Stores, Zustand, and View Models to demonstrate the beauty and benefit of reactive stores in Angular.

[![](https://user-images.githubusercontent.com/210413/213818208-529740e4-2981-4a21-9398-7bc75e4ccf7c.png)](https://codesandbox.io/p/github/ThomasBurleson/zustand-angular-movie-search/draft/frosty-frost?file=%2Fpackage.json&selection=%5B%7B%22endColumn%22%3A47%2C%22endLineNumber%22%3A6%2C%22startColumn%22%3A47%2C%22startLineNumber%22%3A6%7D%5D)

## Background

This repository provides a reference Angular application that demonstrates implementation and use of Zustand "Reactive Stores"

The store [`movies-store.ts`](src/app/data-access/movies/movies.store.ts) is implemented with the Zustand library + middleware. Here are the major highlights:

- Centralized, state management that
  - Easily implements a ViewModel
  - Supports computed properties like `filteredMovies`
  - Easily wraps the Zustand store in an injectable service `MoviesStore`
- Zustand Middleware:
  - Persists to localstorage
  - Immutable store using ImmerJS
  - Support for Redux Dev Tools

<br/>

#### [`movies-store.ts`](src/app/data-access/movies/movies.store.ts)

[![](https://user-images.githubusercontent.com/210413/210112088-a3b33217-e30c-4e87-815a-095470026d28.png)](src/app/data-access/movies/movies.store.ts)

## Live CodeSandbox

![](https://user-images.githubusercontent.com/210413/210112365-8d7616c8-6fce-4614-ad99-5e490a500bb6.png)
