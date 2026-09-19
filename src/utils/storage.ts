import { AppState } from '../types';

export const STORAGE_KEY = 'ai_skill_architect_state';

export const INITIAL_STATE: AppState = {
  profile: {
    name: '',
    profession: '',
    jobTitle: '',
    responsibilities: '',
    aiExperience: '',
    toolsUsed: [],
    timeAvailable: '30 minutes daily',
    formats: [],
    objective: '',
  },
  priorities: {
    selected: [],
    ranked: [],
  },
  diagnostic: {
    administered: [],
    answers: {},
    submitted: false,
  },
  moduleProgress: {},
  libraryShowAll: false,
  settings: {
    theme: 'system',
    language: 'en',
  },
};

let inMemoryFallbackState: AppState | null = null;

export function loadAppState(): AppState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        return {
          ...INITIAL_STATE,
          ...parsed,
          profile: { ...INITIAL_STATE.profile, ...(parsed.profile || {}) },
          priorities: { ...INITIAL_STATE.priorities, ...(parsed.priorities || {}) },
          diagnostic: { ...INITIAL_STATE.diagnostic, ...(parsed.diagnostic || {}) },
          moduleProgress: parsed.moduleProgress || {},
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
        };
      }
    }
  } catch (err) {
    console.warn('LocalStorage read error, using in-memory state:', err);
    if (inMemoryFallbackState) return inMemoryFallbackState;
  }
  return inMemoryFallbackState || INITIAL_STATE;
}

export function saveAppState(state: AppState): boolean {
  inMemoryFallbackState = state;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    }
  } catch (err) {
    console.warn('LocalStorage write error, persisted to memory only:', err);
  }
  return false;
}

export function resetAppState(): AppState {
  inMemoryFallbackState = JSON.parse(JSON.stringify(INITIAL_STATE));
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('LocalStorage clear error:', err);
  }
  return INITIAL_STATE;
}

export function exportAppStateAsJson(state: AppState): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai-skill-architect-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Failed to export state as JSON:', err);
  }
}
