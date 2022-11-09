import { StateCreator, StoreApi, GetState, SetState } from 'zustand';

type State = Object;
export declare type ComputedState<S extends State> = (state: S) => State;

/**
 * Middleware code to support Zustand computed/derived properties
 *
 * @see zustand-middleware-computed-state
 * @note This fixes TS compile issues in current version.
 */
export const computed =
  <S extends State, C extends State>(
    buildStoreFn: StateCreator<S>,
    buildComputedFn: (state: S) => C
  ) =>
  (
    set: SetState<S>,
    get: GetState<S>,
    api: StoreApi<S>,
    mutations: []
  ): S & C => {
    const setWithComputed: SetState<S> = (update, replace) => {
      set((state) => {
        const updated = typeof update === 'object' ? update : update(state);
        const computedState = buildComputedFn({ ...state, ...updated });
        return { ...updated, ...computedState };
      }, replace);
    };
    api.setState = setWithComputed; // for external-to-store use
    const state = buildStoreFn(setWithComputed, get, api, mutations);

    return { ...state, ...buildComputedFn(state) };
  };
