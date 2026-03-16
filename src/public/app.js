// Shared utilities for Stop The Rot

const API = {
  kids: {
    get: (id) => fetch(`/api/kids/${id}`).then(r => r.json()),
    history: (id) => fetch(`/api/kids/${id}/history`).then(r => r.json()),
  },
  chores: {
    list: () => fetch('/api/chores').then(r => r.json()),
    create: (name, difficulty) => fetch('/api/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, difficulty })
    }).then(r => r.json()),
    complete: (choreId, kidId) => fetch(`/api/chores/${choreId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kidId })
    }).then(r => r.json()),
  },
  screenTime: {
    packages: () => fetch('/api/screen-time/packages').then(r => r.json()),
    purchase: (kidId, minutes, coins) => fetch('/api/screen-time/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kidId, minutes, coins })
    }).then(r => r.json()),
    active: (kidId) => fetch(`/api/screen-time/active?kidId=${kidId}`).then(r => r.json()),
  },
};
