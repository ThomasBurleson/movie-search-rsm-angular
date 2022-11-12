import {
  StateCreator,
  StoreApi,
  GetState,
  SetState,
  StoreMutatorIdentifier,
} from 'zustand';

// type Compute = <
//   T,
//   Mps extends [StoreMutatorIdentifier, unknown][] = [],
//   Mcs extends [StoreMutatorIdentifier, unknown][] = []
// >(
//   initializer: StateCreator<T, [...Mps, ['zustand/immer', never]], Mcs>
// ) => StateCreator<T, Mps, [['zustand/immer', never], ...Mcs]>;

// type State = Object;
// export declare type ComputedState<S extends State> = (state: S) => State;

/**
 * Middleware code to support Zustand computed/derived properties
 *
 * @see zustand-middleware-computed-state
 * @note This fixes TS compile issues in current version.
 */
// export const computed =
//   <S extends State, C extends State>(
//     buildStoreFn: StateCreator<S>,
//     buildComputedFn: (state: S) => C
//   ) =>
// (
//   set: SetState<S>,
//   get: GetState<S>,
//   api: StoreApi<S>,
//   mutations: []
// ): S & C => {
//   const setWithComputed: SetState<S> = (update, replace) => {
//     set((state) => {
//       const updated = typeof update === 'object' ? update : update(state);
//       const computedState = buildComputedFn({ ...state, ...updated });
//       return { ...updated, ...computedState };
//     }, replace);
//   };
//   api.setState = setWithComputed; // for external-to-store use
//   const state = buildStoreFn(setWithComputed, get, api, mutations);

//   return { ...state, ...buildComputedFn(state) };
// };

type Computed = <
  StateT extends object = object,
  ComputedT extends object = object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  stateCreator: StateCreator<StateT, Mps, Mcs>,
  computedCalculator: (state: StateT) => ComputedT
) => StateCreator<StateT & ComputedT, Mps, Mcs>;

export const computed: Computed =
  (
    buildState,
    computedProperties // register functions
  ) =>
  (set, get, api, ...b) => {
    const setWithComputed = (update, replace, ...a) => {
      set(
        (state) => {
          const updated = typeof update === 'object' ? update : update(state);
          const computedState = computedProperties({ ...state, ...updated });
          return { ...updated, ...computedState };
        },
        replace,
        ...a
      );
    };

    /**
     * create the store with the `set()` method tail-hooked to compute properties
     */

    api.setState = setWithComputed; // for external-to-store use
    return (buildState as any)(setWithComputed, get, api, ...b);
  };
