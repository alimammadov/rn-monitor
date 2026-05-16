import { emitEvent } from "../core/eventBus";
import {
  getCurrentScreen as readCurrentScreen,
  getScreenState as readScreenState,
  updateCurrentScreen,
} from "../core/screenStore";

export function setCurrentScreen(screenName) {
  const transition = updateCurrentScreen(screenName);

  if (!transition) {
    return readCurrentScreen();
  }

  emitEvent("screen", {
    from: transition.from,
    to: transition.to,
    previousDurationMs: transition.previousDurationMs,
    changedAt: transition.changedAt,
  });

  return transition.to;
}

export function getCurrentScreen() {
  return readCurrentScreen();
}

export function getScreenState() {
  return readScreenState();
}
