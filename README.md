# RN Monitor

**RN Monitor** is a lightweight React Native / Expo performance monitoring SDK for development.

It helps developers quickly understand **why an app or screen feels slow** by collecting live performance signals directly from the running app.

> Current status: early alpha, Phase 4 complete.

---

## Why RN Monitor?

React Native performance issues are often difficult to diagnose in the moment:

- Was the API slow?
- Did the JavaScript thread freeze?
- Did FPS drop after an interaction?
- Did the app recover, or remain degraded?

RN Monitor aims to provide a fast first diagnosis without requiring developers to manually instrument every network request.

---

## Current Features

### Phase 1 â€” Network Monitoring

RN Monitor globally wraps `fetch()` and tracks:

- Request URL
- HTTP method
- Status code
- Request duration
- Slow requests
- Failed requests

Example log:

```txt
[RN Monitor][Network][SLOW] GET https://api.example.com/products - 2420ms - 200
```

---

### Phase 2 â€” JavaScript Lag Detection

RN Monitor uses timer drift to approximate when the JavaScript thread is blocked.

Tracked data:

- Lag duration
- Threshold exceeded
- Timestamp

Example log:

```txt
[RN Monitor][JS Lag] Detected 801ms blocked thread
```

---

### Phase 3 â€” Approximate FPS Monitoring

RN Monitor uses `requestAnimationFrame()` to estimate app smoothness from the JavaScript side.

Tracked data:

- Current approximate FPS
- Average FPS
- FPS drop detection

Example log:

```txt
[RN Monitor][FPS Drop] 20 FPS | Avg 54 FPS
```

> Note: this is not native UI-thread FPS. It is a useful JavaScript-side approximation for development debugging.

---

### Phase 4 â€” Floating Debug Overlay

RN Monitor includes a lightweight in-app overlay:

- Live approximate FPS
- Average FPS
- Latest JavaScript lag
- FPS drop count
- Slow API count
- Failed API count
- Last slow/error API

The overlay stays intentionally small and summary-focused so it does not become the main performance cost inside the app.

---

## Basic Usage

```jsx
import { useEffect } from "react";
import {
  startNetworkMonitor,
  startJSLagMonitor,
  startFPSMonitor,
  RNMonitorOverlay,
} from "rn-monitor";

export default function App() {
  useEffect(() => {
    startNetworkMonitor();
    startJSLagMonitor();
    startFPSMonitor();
  }, []);

  return (
    <>
      <YourApp />
      <RNMonitorOverlay />
    </>
  );
}
```

---

## Current Public API

```js
startNetworkMonitor()
stopNetworkMonitor()

startJSLagMonitor()
stopJSLagMonitor()

startFPSMonitor()
stopFPSMonitor()

<RNMonitorOverlay />

getEvents()
clearEvents()
subscribe()
emitEvent()
```

---

## Internal Architecture

```txt
App Runtime
  â†“
Collectors
  â”œâ”€ NetworkCollector
  â”œâ”€ JSLagCollector
  â””â”€ FPSCollector
  â†“
Event Store
  â†“
Overlay / Console / future dashboard
```

Current source structure:

```txt
src/
  collectors/
    fpsCollector.js
    jsLagCollector.js
    networkCollector.js

  core/
    config.js
    eventBus.js
    eventStore.js

  overlay/
    RNMonitorOverlay.js

  index.js
```

---

## Development Roadmap

### Completed

1. Network monitoring
2. JavaScript lag detection
3. Approximate FPS collector
4. Floating in-app overlay

### Next

5. Render profiler
   - App-level render profiling
   - Optional subtree profiling
   - Slow render event detection

6. Screen monitor
   - Screen-level performance context
   - Router integration
   - Associate network/FPS/lag events with the active screen

### Later Product Direction

7. Local browser dashboard server
   - Full event timeline
   - Charts
   - Filters
   - Correlation between network, FPS, and JavaScript lag
   - Local session inspection
   - Potential JSON export

8. Interaction tracking
   - Optional markers for key actions such as:
     - `show_more_clicked`
     - `add_to_cart`
     - `checkout_submit`
   - Correlate user actions with FPS drops and JavaScript lag

9. Native metrics layer
   - Real UI thread FPS
   - Native dropped frames
   - Memory
   - CPU
   - Startup timings

---

## Product Philosophy

RN Monitor should answer:

> â€œWhy does this app or screen feel slow?â€

The product should be useful with minimal setup:

```txt
Install SDK
Start collectors once
Add overlay once
```

More detailed instrumentation should be optional, not mandatory.

---

## Current Limitations

- FPS is approximate and JavaScript-side only.
- JavaScript lag detection is based on timer drift, not native thread inspection.
- The package is still in early alpha.
- Advanced screen tracking, render profiling, interaction correlation, and dashboard support are planned but not yet implemented.

---

## License

MIT