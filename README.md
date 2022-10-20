# MovieSearch (Angular)

This Angular SPA uses Tailwind, Reactive Stores, Zustand, and View Models to demonstrate the beauty and benefit of reactive state management (RSM) in Angular.

[![](https://user-images.githubusercontent.com/210413/213818208-529740e4-2981-4a21-9398-7bc75e4ccf7c.png)](https://codesandbox.io/p/github/ThomasBurleson/zustand-angular-movie-search/draft/frosty-frost?file=%2Fpackage.json&selection=%5B%7B%22endColumn%22%3A47%2C%22endLineNumber%22%3A6%2C%22startColumn%22%3A47%2C%22startLineNumber%22%3A6%7D%5D)

## Background

This repository provides a MovieSearch Angular application that demonstrates implementation and use of Zustand "Reactive Stores"

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

## RSM

This repository contains labs and solutions for implementing Reactive State Management (RSM) within the **Angular** MovieSearch application using either:

- [@ngneat/Elf](https://ngneat.github.io/elf/docs/store): branch `store-elf-start`
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction): branch `store-zustand-start`

## Concepts

Reactive State Management (RSM) uses a `Facade-Store-DataService` engine and publishes a `ViewModel` for consumption in the UI layers.

See the diagram below for illustration:

![](https://user-images.githubusercontent.com/210413/220697616-0559ac4d-2f2b-494f-8c0e-b7305b8eab9d.png)

## Architecture Secret

The repo "start" branch solution uses mock data with a `useMovieFacade` hook and does not use any reactive state management.

To implement the Reactive State Management (RSM) code, your work will require you to:

- use the `MoviesDataService` instead of mock data
- implement the reactive `MoviesFacade` and the `MoviesStore`, and
- fix the `useMovieFacade`

As you implement the RSM code in the business layer, you will deliver significantly powerful features WITHOUT changing the UI code... that is HUGE! > All the power of RSM is hidden inside the business layer.

In fact, we can easily replace the Elf-based RSM solution with Zustand...without changing the UI or view models.

With well-defined ViewModel APIs, we have a separation of concerns (SoC) between the UI and business layers. And this SoC means that we can implement the UI **in parallel** with the RSM data-access engine.

## Live CodeSandbox

![](https://user-images.githubusercontent.com/210413/210112365-8d7616c8-6fce-4614-ad99-5e490a500bb6.png)

- Run locally `npm i && npm start`

## Slides

[![Open SlideDeck](https://user-images.githubusercontent.com/210413/162356294-eae14ccf-45a4-413d-b3e5-d1019299d33a.png)](https://docs.google.com/presentation/d/16vtqUvu-bHmkWfbvzEZZ_-8YxFs0-h8luA3rYTr-kjU/edit?usp=sharing)
