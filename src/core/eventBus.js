import { addEvent } from "./eventStore";

export function emitEvent(type, data = {}) {
  const event = {
    type,
    timestamp: Date.now(),
    data,
  };

  addEvent(event);

  return event;
}
