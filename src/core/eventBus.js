import { addEvent } from "./eventStore";
import { getCurrentScreen } from "./screenStore";

export function emitEvent(type, data = {}) {
  const event = {
    type,
    timestamp: Date.now(),
    data: {
      screen: getCurrentScreen(),
      ...data,
    },
  };

  addEvent(event);

  return event;
}
