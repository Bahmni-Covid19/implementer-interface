export const selectControl = (metadata) => ({ type: 'SELECT_CONTROL', metadata });

export const selectSource = (concept, id) => ({ type: 'SELECT_SOURCE', concept, id });

export const deselectControl = () => ({ type: 'DESELECT_CONTROL' });

export const removeSourceMap = () => ({ type: 'REMOVE_SOURCE_MAP' });

export const addSourceMap = (sourceMap) => ({ type: 'ADD_SOURCE_MAP', sourceMap });

export const setChangedProperty = (property, id) =>
  ({ type: 'SET_CHANGED_PROPERTY', property, id });

export const sourceChangedProperty = (source) =>
  ({ type: 'SOURCE_CHANGED', source});

export const removeControlProperties = () => ({ type: 'REMOVE_CONTROL_PROPERTIES' });

export const focusControl = (id) => ({ type: 'FOCUS_CONTROL', id });

export const blurControl = () => ({ type: 'BLUR_CONTROL' });
