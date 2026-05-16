import { emitEvent } from "../core/eventBus";
import { monitorConfig } from "../core/config";

let originalFetch = null;
let isMonitoring = false;

function getRequestUrl(input) {
  if (typeof input === "string") {
    return input;
  }

  if (input?.url) {
    return input.url;
  }

  return "unknown-url";
}

function getRequestMethod(input, init) {
  return init?.method || input?.method || "GET";
}

export function startNetworkMonitor() {
  if (isMonitoring) {
    return;
  }

  if (!global.fetch) {
    console.warn("[RN Monitor] global.fetch was not found.");
    return;
  }

  originalFetch = global.fetch;
  isMonitoring = true;

  global.fetch = async function monitoredFetch(input, init = {}) {
    const startedAt = Date.now();
    const url = getRequestUrl(input);
    const method = getRequestMethod(input, init);

    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startedAt;

      const event = emitEvent("network", {
        url,
        method,
        status: response.status,
        duration,
        isSlow: duration >= monitorConfig.slowNetworkThresholdMs,
        isError: !response.ok,
      });

      if (monitorConfig.enableConsoleLogs) {
        const label = event.data.isSlow ? "SLOW" : "OK";

        console.log(
          `[RN Monitor][Network][${label}] ${method} ${url} - ${duration}ms - ${response.status}`
        );
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startedAt;

      emitEvent("network", {
        url,
        method,
        status: null,
        duration,
        isSlow: duration >= monitorConfig.slowNetworkThresholdMs,
        isError: true,
        errorMessage: error?.message || "Unknown network error",
      });

      if (monitorConfig.enableConsoleLogs) {
        console.log(
          `[RN Monitor][Network][ERROR] ${method} ${url} - ${duration}ms`
        );
      }

      throw error;
    }
  };

  console.log("[RN Monitor] Network monitor started.");
}

export function stopNetworkMonitor() {
  if (!isMonitoring || !originalFetch) {
    return;
  }

  global.fetch = originalFetch;
  originalFetch = null;
  isMonitoring = false;

  console.log("[RN Monitor] Network monitor stopped.");
}
