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
  Typography,
} from "@mui/material/";
import { DataContext } from "../Contexts/DataContext";

function PRsSBsTab() {
  const { meetTable, gatherPRsSBs, prsSBsByEvent } = useContext(DataContext);

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

  useEffect(() => {
    if (selectedYear) gatherPRsSBs(selectedYear);
  }, [selectedYear]);

  const bareName = (en) => en.replace(/^(Mens |Womens )/i, "").trim();

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
        Object.entries(prsSBsByEvent).map(([eventName, rows]) => {
          const filteredRows = sbOnly ? rows.filter((e) => e.sb) : rows;
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
                    <th style={{ padding: "4px 8px" }}>SB ({selectedYear})</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((entry, i) => {
                    const rep = entry.pr || entry.sb;
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
                          {entry.pr ? entry.pr.SCORE : "—"}
                        </td>
                        <td style={{ padding: "4px 8px" }}>
                          {entry.sb ? entry.sb.SCORE : "—"}
                        </td>
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
