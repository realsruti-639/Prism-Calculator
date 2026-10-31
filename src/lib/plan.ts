const PLAN_STORAGE_KEY = 'prism-calculator-plan';

export function loadIsPro(): boolean {
  try {
    return window.localStorage.getItem(PLAN_STORAGE_KEY) === 'pro';
  } catch {
    return false;
  }
}
