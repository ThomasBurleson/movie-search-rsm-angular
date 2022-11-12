export function computeWith(set, api, computedProperties) {
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

  return api.setState;
}
