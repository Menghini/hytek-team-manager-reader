import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material/";
import { DataContext } from "../Contexts/DataContext";

function PRsSBsTab() {
  const { meetTable, gatherPRsSBs, prsSBsByEvent, relayResultsByEvent, athletesTable } =
    useContext(DataContext);

  const activeAthleteIds = new Set(
    (athletesTable || []).filter((a) => !a.Inactive).map((a) => a.Athlete),
  );

  const availableYears = [
    ...new Set(
      (meetTable || [])
        .map((m) => (m.START ? new Date(m.START).getFullYear() : null))
        .filter(Boolean),
    ),
  ].sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : availableYears[0];

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [sbOnly, setSbOnly] = useState(true);
  const [multiYear, setMultiYear] = useState(true);
  const [showSplits, setShowSplits] = useState(true);
  const [jumpEvent, setJumpEvent] = useState("");

  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef({});

  const sbYears = multiYear
    ? [selectedYear, selectedYear - 1, selectedYear - 2, selectedYear - 3]
    : [];

  useEffect(() => {
    if (selectedYear) gatherPRsSBs(selectedYear);
  }, [selectedYear]);

  const bareName = (en) => en.replace(/^(Mens |Womens )/i, "").trim();

  const TRACK_INDIVIDUAL_EVENTS = [1, 2, 3, 5];
  const RELAY_EVENTS = [19];
  const FIELD_EVENT_ORDER = [9, 10, 11, 12, 13, 14, 16, 15, 17, 31];

  const getEventSortKey = (rows) => {
    const rep =
      rows[0]?.pr ||
      Object.values(rows[0]?.sbs || {}).find(Boolean) ||
      rows[0]?.splitPr ||
      Object.values(rows[0]?.splitSbs || {}).find(Boolean);
    if (!rep) return [3, 0, 0, 0];
    const ev = rep.RAWEVENT;
    const dist = rep.RAWDISTANCE || 0;
    const gender = rep.GENDER === "Mens" ? 0 : 1;
    if (TRACK_INDIVIDUAL_EVENTS.includes(ev)) return [0, dist, 0, gender];
    if (RELAY_EVENTS.includes(ev)) return [1, dist, 0, gender];
    const fieldIdx = FIELD_EVENT_ORDER.indexOf(ev);
    if (fieldIdx !== -1) return [2, fieldIdx, 0, gender];
    return [3, ev, 0, gender];
  };

  const getRelaySortKey = (rows) => {
    const rep = rows[0];
    if (!rep) return [3, 0, 0, 0];
    const ev = rep.RAWEVENT;
    const dist = rep.RAWDISTANCE || 0;
    const gender = rep.GENDER === "Mens" ? 0 : 1;
    if (RELAY_EVENTS.includes(ev)) return [1, dist, 0, gender];
    return [3, ev, 0, gender];
  };

  const sortedEventEntries = Object.entries(prsSBsByEvent).sort(
    ([, aRows], [, bRows]) => {
      const aKey = getEventSortKey(aRows);
      const bKey = getEventSortKey(bRows);
      for (let i = 0; i < aKey.length; i++) {
        if (aKey[i] !== bKey[i]) return aKey[i] - bKey[i];
      }
      return 0;
    },
  );

  const sortedRelayEntries = Object.entries(relayResultsByEvent || {}).sort(
    ([, aRows], [, bRows]) => {
      const aKey = getRelaySortKey(aRows);
      const bKey = getRelaySortKey(bRows);
      for (let i = 0; i < aKey.length; i++) {
        if (aKey[i] !== bKey[i]) return aKey[i] - bKey[i];
      }
      return 0;
    },
  );

  // Merged list: individual events first (in their order), relay events interleaved by sort key
  const allSortedEntries = [
    ...sortedEventEntries.map(([name, rows]) => ({ type: "individual", eventName: name, rows })),
    ...sortedRelayEntries.map(([name, rows]) => ({ type: "relay", eventName: name, rows })),
  ].sort((a, b) => {
    const aKey = a.type === "relay" ? getRelaySortKey(a.rows) : getEventSortKey(a.rows);
    const bKey = b.type === "relay" ? getRelaySortKey(b.rows) : getEventSortKey(b.rows);
    for (let i = 0; i < aKey.length; i++) {
      if (aKey[i] !== bKey[i]) return aKey[i] - bKey[i];
    }
    return 0;
  });

  const formatRelayAthletes = (athletes) => {
    if (!athletes || athletes.length === 0) return "Unknown";
    const names = athletes.map((a) => {
      const yr = a.GRADYEAR ? ` '${String(a.GRADYEAR).slice(-2)}` : "";
      return `${a.FIRST} ${a.LAST}${yr}`;
    });
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  };

  const meetLookup = {};
  (meetTable || []).forEach((m) => {
    meetLookup[m.MEET] = m;
  });

  const formatMark = (entry) => {
    if (!entry) return "—";
    if (entry.ISFIELDEVENT && entry.CONVERT) {
      return `${entry.SCORE} (${entry.CONVERT})`;
    }
    return entry.SCORE || "—";
  };

  const getMeetTooltip = (entry) => {
    if (!entry || !entry.MEETID) return "";
    const meet = meetLookup[entry.MEETID];
    if (!meet) return "";
    const name = meet.MNAME || "";
    const date = meet.START
      ? new Date(meet.START).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
    return [name, date].filter(Boolean).join(" — ");
  };

  return (
    <Paper
      ref={scrollContainerRef}
      sx={{
        height: { xs: "calc(100dvh - 120px)", sm: "70vh" },
        width: "100%",
        overflow: "auto",
        padding: { xs: "12px", sm: "25px" },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5">PRs / Season Bests</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={sbOnly}
              onChange={(e) => setSbOnly(e.target.checked)}
            />
          }
          label="Current Athletes"
        />
        <FormControlLabel
          control={
            <Switch
              checked={multiYear}
              onChange={(e) => setMultiYear(e.target.checked)}
            />
          }
          label="Show SBs"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showSplits}
              onChange={(e) => setShowSplits(e.target.checked)}
            />
          }
          label="Show Relay Splits"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={selectedYear || ""}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {availableYears.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {allSortedEntries.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="jump-label">Jump to Event</InputLabel>
            <Select
              labelId="jump-label"
              value={jumpEvent}
              label="Jump to Event"
              onChange={(e) => {
                const name = e.target.value;
                setJumpEvent(name);
                const el = sectionRefs.current[name];
                if (el && scrollContainerRef.current) {
                  setTimeout(() => {
                    const container = scrollContainerRef.current;
                    if (!container) return;
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    container.scrollTo({
                      top:
                        elRect.top -
                        containerRect.top +
                        container.scrollTop -
                        8,
                      behavior: "smooth",
                    });
                  }, 0);
                }
              }}
            >
              {allSortedEntries
                .filter(({ type, rows }) => {
                  if (type === "relay") {
                    const filtered = sbOnly
                      ? rows.filter((r) => r.YEAR === selectedYear)
                      : rows;
                    return filtered.length > 0;
                  }
                  if (!sbOnly) return rows.length > 0;
                  return rows.some((e) => {
                    const rep =
                      e.pr ||
                      Object.values(e.sbs || {}).find(Boolean) ||
                      e.splitPr ||
                      Object.values(e.splitSbs || {}).find(Boolean);
                    return activeAthleteIds.has(rep?.ATHLETEID);
                  });
                })
                .map(({ eventName }) => (
                  <MenuItem key={eventName} value={eventName}>
                    {eventName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {Object.keys(prsSBsByEvent).length === 0 ? (
        <Typography>No results found for {selectedYear}.</Typography>
      ) : (
        allSortedEntries.map(({ type, eventName, rows }) => {
          if (type === "relay") {
            const filteredRelayRows = sbOnly
              ? rows.filter((r) => r.YEAR === selectedYear)
              : rows;
            if (filteredRelayRows.length === 0) return null;
            return (
              <div
                key={eventName}
                ref={(el) => { sectionRefs.current[eventName] = el; }}
                style={{ marginBottom: "24px" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h6">{eventName}</Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    ↑ Top
                  </Button>
                </Box>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "2px solid rgba(255,255,255,0.25)" }}>
                      <th style={{ padding: "4px 8px" }}>Rank</th>
                      <th style={{ padding: "4px 8px" }}>Athletes</th>
                      <th style={{ padding: "4px 8px" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRelayRows.map((entry, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <td style={{ padding: "4px 8px" }}>{i + 1}</td>
                        <td style={{ padding: "4px 8px" }}>{formatRelayAthletes(entry.RELAYATHLETES)}</td>
                        <td style={{ padding: "4px 8px" }}>
                          <Tooltip title={getMeetTooltip(entry)} placement="top" arrow>
                            <span>{formatMark(entry)}</span>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Individual event
          const filteredRows = sbOnly
            ? rows.filter((e) => {
                const rep =
                  e.pr ||
                  Object.values(e.sbs || {}).find(Boolean) ||
                  e.splitPr ||
                  Object.values(e.splitSbs || {}).find(Boolean);
                return activeAthleteIds.has(rep?.ATHLETEID);
              })
            : rows;
          if (filteredRows.length === 0) return null;

          const getBestSortId = (entry) => {
            const indiv =
              entry.pr?.SORTID ??
              Object.values(entry.sbs || {}).find(Boolean)?.SORTID ??
              Infinity;
            if (!showSplits) return indiv;
            const split =
              entry.splitPr?.SORTID ??
              Object.values(entry.splitSbs || {}).find(Boolean)?.SORTID ??
              Infinity;
            return Math.min(indiv, split);
          };

          const sortedRows = [...filteredRows].sort(
            (a, b) => getBestSortId(a) - getBestSortId(b),
          );

          return (
            <div
              key={eventName}
              ref={(el) => {
                sectionRefs.current[eventName] = el;
              }}
              style={{ marginBottom: "24px" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">{eventName}</Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() =>
                    scrollContainerRef.current?.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                >
                  ↑ Top
                </Button>
              </Box>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "2px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <th style={{ padding: "4px 8px" }}>Rank</th>
                    <th style={{ padding: "4px 8px" }}>Athlete</th>
                    <th style={{ padding: "4px 8px" }}>PR (All-Time)</th>
                    {sbYears.map((y) => (
                      <th key={y} style={{ padding: "4px 8px" }}>
                        SB ({y})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((entry, i) => {
                    const rep =
                      entry.pr ||
                      Object.values(entry.sbs || {}).find(Boolean) ||
                      entry.splitPr ||
                      Object.values(entry.splitSbs || {}).find(Boolean);
                    const nameStr = rep.GRADYEAR
                      ? `${rep.FIRST} ${rep.LAST} '${String(rep.GRADYEAR).slice(-2)}`
                      : `${rep.FIRST} ${rep.LAST}`;
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          backgroundColor:
                            i % 2 === 0
                              ? "transparent"
                              : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <td style={{ padding: "4px 8px" }}>{i + 1}</td>
                        <td style={{ padding: "4px 8px" }}>{nameStr}</td>
                        <td style={{ padding: "4px 8px" }}>
                          <Tooltip
                            title={getMeetTooltip(entry.pr)}
                            placement="top"
                            arrow
                          >
                            <span>{formatMark(entry.pr)}</span>
                          </Tooltip>
                          {showSplits && entry.splitPr && (
                            <div style={{ fontSize: "0.85em", opacity: 0.65 }}>
                              <Tooltip
                                title={getMeetTooltip(entry.splitPr)}
                                placement="top"
                                arrow
                              >
                                <span>(S: {formatMark(entry.splitPr)})</span>
                              </Tooltip>
                            </div>
                          )}
                        </td>
                        {sbYears.map((y) => (
                          <td key={y} style={{ padding: "4px 8px" }}>
                            <Tooltip
                              title={getMeetTooltip(entry.sbs?.[y])}
                              placement="top"
                              arrow
                            >
                              <span>{formatMark(entry.sbs?.[y])}</span>
                            </Tooltip>
                            {showSplits && entry.splitSbs?.[y] && (
                              <div
                                style={{ fontSize: "0.85em", opacity: 0.65 }}
                              >
                                <Tooltip
                                  title={getMeetTooltip(entry.splitSbs[y])}
                                  placement="top"
                                  arrow
                                >
                                  <span>
                                    (S: {formatMark(entry.splitSbs[y])})
                                  </span>
                                </Tooltip>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </Paper>
  );
}

export default PRsSBsTab;
