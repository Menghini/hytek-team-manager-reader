import React, { useContext, useEffect, useState } from "react";
import {
  Box,
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
  const { meetTable, gatherPRsSBs, prsSBsByEvent, athletesTable } =
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
      sx={{ height: "70vh", width: "100%", overflow: "auto", padding: "25px" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
      </Box>

      {Object.keys(prsSBsByEvent).length === 0 ? (
        <Typography>No results found for {selectedYear}.</Typography>
      ) : (
        sortedEventEntries.map(([eventName, rows]) => {
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
          return (
            <div key={eventName} style={{ marginBottom: "24px" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {eventName}
              </Typography>
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
                  {filteredRows.map((entry, i) => {
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
