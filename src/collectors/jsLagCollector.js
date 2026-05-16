import { emitEvent } from "../core/eventBus";
import { monitorConfig } from "../core/config";

let timeoutId = null;
let isMonitoring = false;

function scheduleNextCheck() {
  const intervalMs = monitorConfig.jsLagCheckIntervalMs;
  const scheduledAt = Date.now();

  timeoutId = setTimeout(() => {
    const now = Date.now();
    const expectedAt = scheduledAt + intervalMs;
    const lagMs = Math.max(0, now - expectedAt);

    if (lagMs >= monitorConfig.jsLagThresholdMs) {
      emitEvent("js_lag", {
        lagMs,
        thresholdMs: monitorConfig.jsLagThresholdMs,
        checkIntervalMs: intervalMs,
      });

      if (monitorConfig.enableConsoleLogs) {
        console.log(
          `[RN Monitor][JS Lag] Detected ${lagMs}ms blocked thread`
        );
      }
    }

    if (isMonitoring) {
      scheduleNextCheck();
    }
  }, intervalMs);
}

export function startJSLagMonitor() {
  if (isMonitoring) {
    return;
  }

  isMonitoring = true;
  scheduleNextCheck();

  if (monitorConfig.enableConsoleLogs) {
    console.log("[RN Monitor] JS lag monitor started.");
  }
}

export function stopJSLagMonitor() {
  if (!isMonitoring) {
    return;
  }

  isMonitoring = false;

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (monitorConfig.enableConsoleLogs) {
    console.log("[RN Monitor] JS lag monitor stopped.");
  }
}
