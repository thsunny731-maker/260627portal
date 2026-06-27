// src/services/db.js
// simple IndexedDB wrapper for apps

const DB_NAME = 'portalDB';
const DB_VERSION = 1;
const STORE_APPS = 'apps';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_APPS)) {
        db.createObjectStore(STORE_APPS, { keyPath: 'id' });
      }
    };
  });
}

import defaultApps from '../data/apps.json';

export async function getApps() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_APPS, 'readonly');
    const store = tx.objectStore(STORE_APPS);
    const request = store.getAll();
    request.onsuccess = () => {
      const localApps = request.result;
      
      const mergedMap = new Map();
      
      // 먼저 기본 앱(apps.json)을 추가합니다.
      defaultApps.forEach(app => mergedMap.set(app.id, app));
      
      // 로컬에 저장된 앱(추가/수정됨)으로 덮어씁니다.
      localApps.forEach(app => mergedMap.set(app.id, app));
      
      resolve(Array.from(mergedMap.values()));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveApp(app) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_APPS, 'readwrite');
    const store = tx.objectStore(STORE_APPS);
    app.updatedAt = new Date().toISOString();
    if (!app.createdAt) app.createdAt = app.updatedAt;
    const request = store.put(app);
    request.onsuccess = () => resolve(app);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteApp(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_APPS, 'readwrite');
    const store = tx.objectStore(STORE_APPS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
