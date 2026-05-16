import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getEvents, subscribe } from "../core/eventStore";
import { getCurrentScreen } from "../screen/screenMonitor";

function createInitialSummary() {
  return {
    currentScreen: getCurrentScreen(),
    previousScreen: null,
    screenTransitions: 0,
    lastIssueScreen: null,

    currentFps: null,
    averageFps: null,
    fpsDrops: 0,

    latestJsLagMs: null,

    slowApiCount: 0,
    failedApiCount: 0,
    latestProblemApi: null,

    slowRenderCount: 0,
    latestSlowRenderProfilerId: null,
    latestSlowRenderDurationMs: null,
  };
}

function markIssueScreen(next, data) {
  if (data?.screen) {
    next.lastIssueScreen = data.screen;
  }
}

function applyEvent(summary, event) {
  const next = { ...summary };
  const data = event?.data ?? {};

  if (data.screen) {
    next.currentScreen = data.screen;
  }

  if (event?.type === "screen") {
    next.currentScreen = data.to ?? data.screen ?? next.currentScreen;
    next.previousScreen = data.from ?? next.previousScreen;
    next.screenTransitions += 1;
  }

  if (event?.type === "fps") {
    next.currentFps = data.fps ?? next.currentFps;
    next.averageFps = data.averageFps ?? next.averageFps;

    if (data.isLow) {
      next.fpsDrops += 1;
      markIssueScreen(next, data);
    }
  }

  if (event?.type === "js_lag") {
    next.latestJsLagMs = data.lagMs ?? next.latestJsLagMs;
    markIssueScreen(next, data);
  }

  if (event?.type === "network") {
    if (data.isSlow) {
      next.slowApiCount += 1;
      next.latestProblemApi = data.url ?? next.latestProblemApi;
      markIssueScreen(next, data);
    }

    if (data.isError) {
      next.failedApiCount += 1;
      next.latestProblemApi = data.url ?? next.latestProblemApi;
      markIssueScreen(next, data);
    }
  }

  if (event?.type === "render" && data.isSlow) {
    next.slowRenderCount += 1;
    next.latestSlowRenderProfilerId =
      data.profilerId ?? next.latestSlowRenderProfilerId;
    next.latestSlowRenderDurationMs =
      data.actualDurationMs ?? next.latestSlowRenderDurationMs;
    markIssueScreen(next, data);
  }

  return next;
}

function buildSummaryFromEvents(events) {
  return events.reduce(
    (summary, event) => applyEvent(summary, event),
    createInitialSummary()
  );
}

function formatMetric(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return `${value}${suffix}`;
}

export function RNMonitorOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(() =>
    buildSummaryFromEvents(getEvents())
  );

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setSummary((current) => applyEvent(current, event));
    });

    return unsubscribe;
  }, []);

  const latestApiLabel = useMemo(() => {
    if (!summary.latestProblemApi) {
      return "--";
    }

    return summary.latestProblemApi.length > 34
      ? `${summary.latestProblemApi.slice(0, 34)}...`
      : summary.latestProblemApi;
  }, [summary.latestProblemApi]);

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {isOpen && (
        <View style={styles.panel}>
          <Text style={styles.title}>RN Monitor</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screen Context</Text>
            <Text style={styles.metric}>
              Current Screen: {formatMetric(summary.currentScreen)}
            </Text>
            <Text style={styles.metric}>
              Previous Screen: {formatMetric(summary.previousScreen)}
            </Text>
            <Text style={styles.metric}>
              Transitions: {formatMetric(summary.screenTransitions)}
            </Text>
            <Text style={styles.metric}>
              Last Issue Screen: {formatMetric(summary.lastIssueScreen)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <Text style={styles.metric}>
              FPS: {formatMetric(summary.currentFps)}
            </Text>
            <Text style={styles.metric}>
              Avg FPS: {formatMetric(summary.averageFps)}
            </Text>
            <Text style={styles.metric}>
              FPS Drops: {formatMetric(summary.fpsDrops)}
            </Text>
            <Text style={styles.metric}>
              Latest JS Lag: {formatMetric(summary.latestJsLagMs, "ms")}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network</Text>
            <Text style={styles.metric}>
              Slow APIs: {formatMetric(summary.slowApiCount)}
            </Text>
            <Text style={styles.metric}>
              Failed APIs: {formatMetric(summary.failedApiCount)}
            </Text>
            <Text style={styles.metric}>
              Last Problem API: {latestApiLabel}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Render Profiler</Text>
            <Text style={styles.metric}>
              Slow Renders: {formatMetric(summary.slowRenderCount)}
            </Text>
            <Text style={styles.metric}>
              Latest Profiler: {formatMetric(summary.latestSlowRenderProfilerId)}
            </Text>
            <Text style={styles.metric}>
              Latest Duration: {formatMetric(summary.latestSlowRenderDurationMs, "ms")}
            </Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setIsOpen((current) => !current)}
        style={styles.fab}
      >
        <Text style={styles.fabText}>{isOpen ? "×" : "RN"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    right: 16,
    bottom: 24,
    alignItems: "flex-end",
    zIndex: 9999,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    marginTop: 12,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  panel: {
    width: 305,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#111827",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  metric: {
    color: "#E5E7EB",
    fontSize: 12,
    lineHeight: 18,
  },
});
