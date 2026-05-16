let currentScreen = "Unknown";
let previousScreen = null;
let enteredAt = Date.now();

function normalizeScreenName(screenName) {
  if (typeof screenName !== "string") {
    return "Unknown";
  }

  const trimmed = screenName.trim();

  return trimmed.length > 0 ? trimmed : "Unknown";
}

export function updateCurrentScreen(screenName) {
  const nextScreen = normalizeScreenName(screenName);

  if (nextScreen === currentScreen) {
    return null;
  }

  const changedAt = Date.now();
  const from = currentScreen;
  const to = nextScreen;
  const previousDurationMs = enteredAt
    ? Math.max(0, changedAt - enteredAt)
    : null;

  previousScreen = from;
  currentScreen = to;
  enteredAt = changedAt;

  return {
    from,
    to,
    previousDurationMs,
    changedAt,
  };
}

export function getCurrentScreen() {
  return currentScreen;
}

export function getScreenState() {
  return {
    currentScreen,
    previousScreen,
    enteredAt,
  };
}
