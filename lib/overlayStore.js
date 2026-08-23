const store = {
  users: {
    extras: new Map(),
    deleted: new Set(),
    nextId: 10001,
  },
  products: {
    extras: new Map(),
    deleted: new Set(),
    nextId: 10001,
  },
};

function chooseId(entity, suggestedId) {
  const numericId = Number(suggestedId);
  const exists =
    store[entity].extras.has(numericId) || store[entity].deleted.has(numericId);

  if (Number.isInteger(numericId) && numericId >= 10001 && !exists) {
    return numericId;
  }

  const nextId = store[entity].nextId;
  store[entity].nextId += 1;
  return nextId;
}

export function mergeCollection(entity, items) {
  const byId = new Map();

  items.forEach((item) => {
    const id = Number(item.id);
    if (store[entity].deleted.has(id)) {
      return;
    }
    byId.set(id, store[entity].extras.get(id) || item);
  });

  store[entity].extras.forEach((item, id) => {
    if (!store[entity].deleted.has(id) && !byId.has(id)) {
      byId.set(id, item);
    }
  });

  return Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id));
}

export function resolveItem(entity, id, fallback) {
  const numericId = Number(id);
  if (store[entity].deleted.has(numericId)) {
    return null;
  }
  if (store[entity].extras.has(numericId)) {
    return store[entity].extras.get(numericId);
  }
  return fallback || null;
}

export function saveCreated(entity, payload, apiResult) {
  const id = chooseId(entity, apiResult?.id);
  const record = { ...payload, ...apiResult, id };
  store[entity].extras.set(id, record);
  store[entity].deleted.delete(id);
  return record;
}

export function saveUpdated(entity, id, payload, apiResult) {
  const numericId = Number(id);
  const record = {
    ...payload,
    ...apiResult,
    id: numericId,
  };
  store[entity].extras.set(numericId, record);
  store[entity].deleted.delete(numericId);
  return record;
}

export function saveDeleted(entity, id) {
  const numericId = Number(id);
  store[entity].deleted.add(numericId);
  store[entity].extras.delete(numericId);
  return { id: numericId };
}

export function isDeleted(entity, id) {
  return store[entity].deleted.has(Number(id));
}
