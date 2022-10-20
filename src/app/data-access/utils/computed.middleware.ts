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
    create: StateCreator<S>,
    compute: (state: S) => C
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
        const computedState = compute({ ...state, ...updated });
        return { ...updated, ...computedState };
      }, replace);
    };
    api.setState = setWithComputed;
    const state = create(setWithComputed, get, api, mutations);
    return { ...state, ...compute(state) };
  };
