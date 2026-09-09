import { createStore } from "redux";

import reducer from "./rootReducer";

// Bump STORAGE_SCHEMA whenever the persisted state shape changes in a
// non-backward-compatible way. Old data (missing the marker) is cleared so
// stale reducer fields cannot crash the new UI.
const STORAGE_SCHEMA = "v2";
const STORAGE_KEYS = [
  "global",
  "message",
  "moral",
  "sport",
  "study",
  "ability",
  "art",
  "work",
  "setting",
];

let stateReset = false;

function swapPreloadState() {
  try {
    const schema = localStorage.getItem("__schema");
    if (schema !== STORAGE_SCHEMA) {
      // Outdated or unknown persisted data: reset to the fresh initial state.
      STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem("__schema");
      stateReset = true;
      return undefined;
    }
    const globalState = localStorage.getItem("global");
    const message = localStorage.getItem("message");
    const moral = localStorage.getItem("moral");
    const sport = localStorage.getItem("sport");
    const study = localStorage.getItem("study");
    const ability = localStorage.getItem("ability");
    const art = localStorage.getItem("art");
    const work = localStorage.getItem("work");
    const setting = localStorage.getItem("setting");
    return {
      global: globalState ? JSON.parse(globalState) : undefined,
      message: message ? JSON.parse(message) : undefined,
      moral: moral ? JSON.parse(moral) : undefined,
      sport: sport ? JSON.parse(sport) : undefined,
      study: study ? JSON.parse(study) : undefined,
      ability: ability ? JSON.parse(ability) : undefined,
      art: art ? JSON.parse(art) : undefined,
      work: work ? JSON.parse(work) : undefined,
      setting: setting ? JSON.parse(setting) : undefined,
    };
  } catch (error) {
    return undefined;
  }
}

export function writePreloadState() {
  try {
    localStorage.setItem("__schema", STORAGE_SCHEMA);
  } catch (error) {
    // ignore quota/security write failures
  }
}

export function consumeStateResetFlag() {
  const reset = stateReset;
  stateReset = false;
  return reset;
}

export default createStore(reducer, swapPreloadState());
