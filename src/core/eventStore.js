const events = [];
const listeners = new Set();

export function addEvent(event) {
  events.push(event);

  listeners.forEach((listener) => {
    listener(event);
  });
}

export function getEvents() {
  return [...events];
}

export function clearEvents() {
  events.length = 0;
}

export function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}