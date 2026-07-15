import { useSyncExternalStore } from "react";
import { generateSeed } from "./seed";
import type { MspData } from "./types";

const STORAGE_KEY = "msp-academy-data-v1";

let data: MspData = generateSeed();
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked - ignore
  }
}

export function hydrateFromStorage() {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      data = JSON.parse(raw) as MspData;
      notify();
    } else {
      persist();
    }
  } catch {
    // ignore
  }
}

export function resetDemoData() {
  data = generateSeed();
  persist();
  notify();
}

export function getData(): MspData {
  return data;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMsp<T>(selector: (d: MspData) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(data),
    () => selector(data),
  );
}

export function update(mutator: (d: MspData) => void) {
  const draft = structuredClone(data);
  mutator(draft);
  data = draft;
  persist();
  notify();
}
