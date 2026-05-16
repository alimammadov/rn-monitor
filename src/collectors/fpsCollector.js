import { emitEvent } from "../core/eventBus";
import { monitorConfig } from "../core/config";

let isMonitoring = false;
let animationFrameId = null;

let frameCount = 0;
let sampleStartedAt = 0;

let totalFps = 0;
let fpsSamples = 0;

function readNow(timestamp) {
  return typeof timestamp === "number" ? timestamp : Date.now();
}

function calculateAverageFps(fps) {
  totalFps += fps;
  fpsSamples += 1;

  return Math.round(totalFps / fpsSamples);
}

function trackFrame(timestamp) {
  if (!isMonitoring) {
    return;
  }

  const now = readNow(timestamp);

  if (!sampleStartedAt) {
    sampleStartedAt = now;
  }

  frameCount += 1;

  const elapsedMs = now - sampleStartedAt;

  if (elapsedMs >= monitorConfig.fpsSampleIntervalMs) {
    const fps = Math.round((frameCount * 1000) / elapsedMs);
    const averageFps = calculateAverageFps(fps);
    const isLow = fps < monitorConfig.lowFpsThreshold;

    emitEvent("fps", {
      fps,
      averageFps,
      isLow,
      lowFpsThreshold: monitorConfig.lowFpsThreshold,
      sampleWindowMs: Math.round(elapsedMs),
    });

    if (monitorConfig.enableConsoleLogs) {
      const label = isLow ? "FPS Drop" : "FPS";

      console.log(
        `[RN Monitor][${label}] ${fps} FPS | Avg ${averageFps} FPS`
      );
    }

    frameCount = 0;
    sampleStartedAt = now;
  }

  animationFrameId = requestAnimationFrame(trackFrame);
}

export function startFPSMonitor() {
  if (isMonitoring) {
    return;
  }

  if (typeof requestAnimationFrame !== "function") {
    console.warn("[RN Monitor] requestAnimationFrame was not found.");
    return;
  }

  isMonitoring = true;
  frameCount = 0;
  sampleStartedAt = 0;
  totalFps = 0;
  fpsSamples = 0;

  animationFrameId = requestAnimationFrame(trackFrame);

  if (monitorConfig.enableConsoleLogs) {
    console.log("[RN Monitor] FPS monitor started.");
  }
}

export function stopFPSMonitor() {
  if (!isMonitoring) {
    return;
  }

  isMonitoring = false;

  if (
    animationFrameId !== null &&
    typeof cancelAnimationFrame === "function"
  ) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = null;
  frameCount = 0;
  sampleStartedAt = 0;

  if (monitorConfig.enableConsoleLogs) {
    console.log("[RN Monitor] FPS monitor stopped.");
  }
}