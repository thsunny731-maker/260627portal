// src/services/auth.js

async function hashString(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function setAdminCode(code) {
  if (!code) {
    localStorage.removeItem('adminCodeHash');
    return;
  }
  const hash = await hashString(code);
  localStorage.setItem('adminCodeHash', hash);
}

export function hasAdminCode() {
  return !!localStorage.getItem('adminCodeHash');
}

export async function verifyAdminCode(code) {
  const savedHash = localStorage.getItem('adminCodeHash');
  if (!savedHash) return false;
  const hash = await hashString(code);
  return hash === savedHash;
}

let isUnlocked = false;
let unlockListeners = [];

export function subscribeUnlock(listener) {
  unlockListeners.push(listener);
  return () => { unlockListeners = unlockListeners.filter(l => l !== listener); };
}

export function getUnlockState() {
  return isUnlocked;
}

export function setUnlockState(state) {
  isUnlocked = state;
  unlockListeners.forEach(l => l(state));
}
