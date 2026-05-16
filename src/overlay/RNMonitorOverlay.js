import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getEvents, subscribe } from "../core/eventStore";

const emptySummary = {
  currentFps: null,
  averageFps: null,
  latestJsLagMs: null,
  slowApiCount: 0,
  failedApiCount: 0,
  fpsDropCount: 0,
  latestProblemApi: null,
};

function applyEvent(summary, event) {
  const next = { ...summary };

  if (event.type === "fps") {
    next.currentFps = event.data.fps;
    next.averageFps = event.data.averageFps;

    if (event.data.isLow) {
      next.fpsDropCount += 1;
    }
  }

  if (event.type === "js_lag") {
    next.latestJsLagMs = event.data.lagMs;
  }

  if (event.type === "network") {
    if (event.data.isSlow) {
      next.slowApiCount += 1;
    }

    if (event.data.isError) {
      next.failedApiCount += 1;
    }

    if (event.data.isSlow || event.data.isError) {
      next.latestProblemApi = {
        method: event.data.method,
        url: event.data.url,
        duration: event.data.duration,
        status: event.data.status,
        isSlow: event.data.isSlow,
        isError: event.data.isError,
      };
    }
  }

  return next;
}

function buildSummaryFromHistory(events) {
  return events.reduce((summary, event) => {
    return applyEvent(summary, event);
  }, emptySummary);
}

function formatApiLabel(api) {
  if (!api) {
    return "None";
  }

  const kind = api.isError ? "ERROR" : "SLOW";
  return `${kind} ${api.method} ${api.duration}ms`;
}

export function RNMonitorOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(() => {
    return buildSummaryFromHistory(getEvents());
  });

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setSummary((current) => applyEvent(current, event));
    });

    return unsubscribe;
  }, []);

  if (!isOpen) {
    return (
      <View style={styles.collapsedRoot} pointerEvents="box-none">
        <Pressable style={styles.floatingButton} onPress={() => setIsOpen(true)}>
          <Text style={styles.floatingButtonTitle}>RN</Text>
          <Text style={styles.floatingButtonMeta}>
            {summary.currentFps ?? "--"} FPS
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.expandedRoot} pointerEvents="box-none">
      <View style={styles.panel}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>RN Monitor</Text>
            <Text style={styles.subtitle}>Live app health</Text>
          </View>

          <Pressable style={styles.closeButton} onPress={() => setIsOpen(false)}>
            <Text style={styles.closeText}>Ã—</Text>
          </Pressable>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>FPS</Text>
            <Text style={styles.metricValue}>{summary.currentFps ?? "--"}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg FPS</Text>
            <Text style={styles.metricValue}>{summary.averageFps ?? "--"}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>JS Lag</Text>
            <Text style={styles.metricValue}>
              {summary.latestJsLagMs !== null ? `${summary.latestJsLagMs}ms` : "--"}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>FPS Drops</Text>
            <Text style={styles.metricValue}>{summary.fpsDropCount}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Slow APIs</Text>
          <Text style={styles.rowValue}>{summary.slowApiCount}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Failed APIs</Text>
          <Text style={styles.rowValue}>{summary.failedApiCount}</Text>
        </View>

        <View style={styles.apiBox}>
          <Text style={styles.apiLabel}>Last slow/error API</Text>
          <Text style={styles.apiValue}>
            {formatApiLabel(summary.latestProblemApi)}
          </Text>
          {summary.latestProblemApi && (
            <Text style={styles.apiUrl} numberOfLines={2}>
              {summary.latestProblemApi.url}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedRoot: {
    position: "absolute",
    right: 16,
    bottom: 28,
    zIndex: 9999,
    elevation: 20,
  },
  expandedRoot: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    zIndex: 9999,
    elevation: 20,
  },
  floatingButton: {
    minWidth: 82,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  floatingButtonTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  floatingButtonMeta: {
    color: "#d6d6d6",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  panel: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#bdbdbd",
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 26,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: "47%",
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    padding: 12,
  },
  metricLabel: {
    color: "#a8a8a8",
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#252525",
  },
  rowLabel: {
    color: "#d2d2d2",
    fontSize: 14,
    fontWeight: "600",
  },
  rowValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  apiBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    padding: 12,
  },
  apiLabel: {
    color: "#a8a8a8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  apiValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  apiUrl: {
    color: "#d2d2d2",
    fontSize: 12,
    marginTop: 5,
  },
});