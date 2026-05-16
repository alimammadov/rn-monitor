import React, { Profiler } from "react";
import { monitorConfig } from "../core/config";
import { emitEvent } from "../core/eventBus";

export function RNMonitorProfiler({
  id = "RNMonitorProfiler",
  children,
}) {
  const handleRender = (
    profilerId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    const thresholdMs = monitorConfig.slowRenderThresholdMs ?? 16;

    const normalizedActualDuration = Number(actualDuration.toFixed(2));
    const normalizedBaseDuration = Number(baseDuration.toFixed(2));

    emitEvent("render", {
      profilerId,
      phase,
      actualDurationMs: normalizedActualDuration,
      baseDurationMs: normalizedBaseDuration,
      startTime,
      commitTime,
      thresholdMs,
      isSlow: normalizedActualDuration >= thresholdMs,
    });
  };

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}
