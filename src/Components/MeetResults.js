import React, { useState, useContext } from "react";
import "../css/App.css";
import { styled } from "@mui/material/styles";
import { TabContext, TabPanel, TabList } from "@mui/lab/";
import {
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tabs,
  Tab,
  TablePaginationBaseProps,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material/";
import { DataGrid } from "@mui/x-data-grid";
import { DataContext } from "../Contexts/DataContext";
import MeetsTab from "./MeetsTab";
import { LocalPrintshopSharp } from "@mui/icons-material";

function MeetResults() {
  const [meetResultsTabValue, setMeetResultsTabValue] = React.useState(1);
  const [hidePRsFromSBs, setHidePRsFromSBs] = React.useState(true);

  const handleMeetResultsTabsChange = (event, newValue) => {
    //This code is ran once to set the tabs to the first tab.
    setMeetResultsTabValue(newValue);
  };

  React.useEffect(() => {
    setMeetResultsTabValue("1");
  }, []);

  const {
    handleFileDrop,
    fileName,
    meetTable,
    meetTableWithId,
    meetTableColumns,
    openResultsTable,
    handleClose,
    meetInfo,
    selectedMeetRows,
    resultsTableColumns,
    athletesTableWithId,
    athletesTableColumns,
    loading,
    open,
    returnPRs,
  } = useContext(DataContext);

  const Demo = styled("div")(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
  }));

  function generate(element) {
    return [0, 1, 2].map((value) =>
      React.cloneElement(element, {
        key: value,
      }),
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <TabContext value={meetResultsTabValue.toString()}>
        <DialogTitle>
          {meetInfo !== null
            ? meetInfo.meetName +
              " Results on " +
              new Date(meetInfo.meetDate).toLocaleDateString("en-US", {
                timeZone: "UTC",
              })
            : "No Meet Results"}
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleMeetResultsTabsChange}
            aria-label="lab API tabs example"
          >
            <Tab label="Meet Results" value="1" />
            <Tab label="Top 10s" value="2" />
            <Tab label="PRs" value="3" />
            <Tab label="SBs" value="4" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {/*if the first tab is selected, then the meet results will show up here*/}
          <DialogContent>
            <DialogContentText>
              Table showing athletes, distances, scores, and results for the
              selected meet.
            </DialogContentText>
            <Paper sx={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={selectedMeetRows}
                columns={resultsTableColumns}
                getRowId={(row) => row.id}
              />
            </Paper>
          </DialogContent>
        </TabPanel>
        <TabPanel value="2">
          {/*Top 10s tab - school records and top 10s set at this meet*/}
          <Paper sx={{ height: 564, width: "100%", overflow: "auto" }}>
            <DialogContent>
              {(() => {
                const ordinal = (n) => {
                  if (n >= 11 && n <= 13) return `${n}th`;
                  switch (n % 10) {
                    case 1:
                      return `${n}st`;
                    case 2:
                      return `${n}nd`;
                    case 3:
                      return `${n}rd`;
                    default:
                      return `${n}th`;
                  }
                };
                const getEventVerb = (eventName) => {
                  const bare = eventName
                    .replace(/^(Mens |Womens )/i, "")
                    .trim();
                  if (/Jump|Vault/i.test(bare))
                    return { action: "jumped", noun: "jump" };
                  if (/Shot Put|Discus|Hammer|Javelin|Weight/i.test(bare))
                    return { action: "threw", noun: "throw" };
                  return { action: "ran", noun: "time" };
                };
                const formatRelayNames = (athletes) => {
                  if (!athletes || athletes.length === 0) return "";
                  const names = athletes.map(
                    (a) => `${a.FIRST} ${a.LAST} '${a.GRADYEAR}`,
                  );
                  if (names.length === 1) return names[0];
                  return (
                    names.slice(0, -1).join(", ") +
                    ", and " +
                    names[names.length - 1]
                  );
                };
                const bareName = (en) =>
                  en.replace(/^(Mens |Womens )/i, "").trim();

                const dedupeRelays = (rows) => {
                  const seenRelayIds = new Set();
                  return rows.filter((r) => {
                    if (r.EVENTTYPE !== "Relay") return true;
                    if (seenRelayIds.has(r.ATHLETEID)) return false;
                    seenRelayIds.add(r.ATHLETEID);
                    return true;
                  });
                };
                const schoolRecords = dedupeRelays(
                  selectedMeetRows.filter(
                    (r) =>
                      r.ALLTIMERANK === 1 &&
                      (r.EVENTTYPE === "Individual" || r.EVENTTYPE === "Relay"),
                  ),
                );
                const top10s = dedupeRelays(
                  selectedMeetRows.filter(
                    (r) =>
                      r.ALLTIMERANK >= 2 &&
                      r.ALLTIMERANK <= 10 &&
                      (r.EVENTTYPE === "Individual" || r.EVENTTYPE === "Relay"),
                  ),
                );

                if (schoolRecords.length === 0 && top10s.length === 0) {
                  return (
                    <Typography>
                      No school records or top 10s were set during this meet
                    </Typography>
                  );
                }

                return (
                  <>
                    {schoolRecords.length > 0 && (
                      <>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          The following school records were broken:
                        </Typography>
                        <ul>
                          {schoolRecords.map((row) => {
                            const { noun } = getEventVerb(row.EVENTNAME);
                            const en = bareName(row.EVENTNAME);
                            let prevText = "";
                            if (row.PREVRECORD) {
                              prevText = row.PREVRECORD.isRelay
                                ? ` This beats the previous record of ${row.PREVRECORD.mark}${row.PREVRECORD.year ? ` set in ${row.PREVRECORD.year}` : ""}.`
                                : ` This beats the previous record set by ${row.PREVRECORD.athleteName} of ${row.PREVRECORD.mark}${row.PREVRECORD.year ? ` set in ${row.PREVRECORD.year}` : ""}.`;
                            }
                            if (row.EVENTTYPE === "Relay") {
                              return (
                                <li key={row.id}>
                                  {`${formatRelayNames(row.RELAYATHLETES)} set the school record in the ${en} with a time of ${row.SCORE}.${prevText}`}
                                </li>
                              );
                            }
                            return (
                              <li key={row.id}>
                                {`${row.FIRST} ${row.LAST} '${row.GRADYEAR} set the school record in the ${en} with a ${noun} of ${row.SCORE}.${prevText}`}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                    {top10s.length > 0 && (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ mt: schoolRecords.length > 0 ? 2 : 0, mb: 1 }}
                        >
                          The following Top 10s were set:
                        </Typography>
                        <ul>
                          {top10s.map((row) => {
                            const { action, noun } = getEventVerb(
                              row.EVENTNAME,
                            );
                            const en = bareName(row.EVENTNAME);
                            if (row.EVENTTYPE === "Relay") {
                              return (
                                <li key={row.id}>
                                  {`${formatRelayNames(row.RELAYATHLETES)} ran the ${ordinal(row.ALLTIMERANK)} best time in school history in the ${en} with a time of ${row.SCORE}.`}
                                </li>
                              );
                            }
                            return (
                              <li key={row.id}>
                                {`${row.FIRST} ${row.LAST} '${row.GRADYEAR} ${action} ${row.SCORE} in the ${en} which is the ${ordinal(row.ALLTIMERANK)} best ${noun} in school history.`}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </>
                );
              })()}
            </DialogContent>
          </Paper>
        </TabPanel>
        <TabPanel value="3">
          {/*if the first tab is selected, then PR info will show up here*/}
          <Paper sx={{ height: 564, width: "100%" }}>
            <DialogContent>
              <ul>
                {selectedMeetRows.filter(
                  (row) =>
                    row.EVENTTYPE === "Individual" &&
                    ((row.IMPROVE && row.IMPROVE.charAt(0) === "-") ||
                      !row.IMPROVE ||
                      row.IMPROVE.trim() === ""),
                ).length > 0 ? (
                  selectedMeetRows.map(
                    (row) =>
                      row.EVENTTYPE === "Individual" &&
                      ((row.IMPROVE && row.IMPROVE.charAt(0) === "-") ||
                        !row.IMPROVE ||
                        row.IMPROVE.trim() === "") && (
                        <li key={row.id}>
                          {`${row.FIRST} ${row.LAST} '${
                            row.GRADYEAR
                          } PRed in the ${row.EVENTNAME.replace(
                            /^(Mens |Womens )/i,
                            "",
                          )} with a PR of ${row.SCORE}${
                            row.IMPROVE && row.IMPROVE.charAt(0) === "-"
                              ? ` by ${row.IMPROVE.substring(1)}`
                              : ""
                          }`}
                        </li>
                      ),
                  )
                ) : (
                  <Typography sx={{ marginBottom: "8px" }}>
                    No one PRed during this meet
                  </Typography>
                )}
              </ul>
            </DialogContent>
          </Paper>
        </TabPanel>
        <TabPanel value="4">
          {/*Season Bests tab*/}
          <Paper sx={{ height: 564, width: "100%", overflow: "auto" }}>
            <DialogContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={hidePRsFromSBs}
                    onChange={(e) => setHidePRsFromSBs(e.target.checked)}
                  />
                }
                label="Hide PRs"
              />
              <ul>
                {(() => {
                  const isSB = (row) =>
                    (row.IMPROVESEASON &&
                      row.IMPROVESEASON.charAt(0) === "-") ||
                    !row.IMPROVESEASON ||
                    row.IMPROVESEASON.trim() === "";

                  const individualSBs = selectedMeetRows.filter(
                    (row) =>
                      row.EVENTTYPE === "Individual" &&
                      isSB(row) &&
                      !(
                        hidePRsFromSBs &&
                        ((row.IMPROVE && row.IMPROVE.charAt(0) === "-") ||
                          !row.IMPROVE ||
                          row.IMPROVE.trim() === "")
                      ),
                  );

                  const relayGroups = {};
                  selectedMeetRows
                    .filter((row) => row.EVENTTYPE === "Relay" && isSB(row))
                    .forEach((row) => {
                      if (!relayGroups[row.RESULT])
                        relayGroups[row.RESULT] = [];
                      relayGroups[row.RESULT].push(row);
                    });
                  const relayTeams = Object.values(relayGroups);

                  if (individualSBs.length === 0 && relayTeams.length === 0) {
                    return (
                      <Typography sx={{ marginBottom: "8px" }}>
                        No one got a season best during this meet
                      </Typography>
                    );
                  }

                  return (
                    <>
                      {individualSBs.map((row) => (
                        <li key={row.id}>
                          {`${row.FIRST} ${row.LAST} '${
                            row.GRADYEAR
                          } got a SB in the ${row.EVENTNAME.replace(
                            /^(Mens |Womens )/i,
                            "",
                          )} with a SB of ${row.SCORE}${
                            row.IMPROVESEASON &&
                            row.IMPROVESEASON.charAt(0) === "-"
                              ? ` by ${row.IMPROVESEASON.substring(1)}`
                              : ""
                          }`}
                        </li>
                      ))}
                      {relayTeams.map((team) => {
                        const rep = team[0];
                        const athletes = rep.RELAYATHLETES || [];
                        const names = athletes.map(
                          (a) => `${a.FIRST} ${a.LAST} '${a.GRADYEAR}`,
                        );
                        const nameStr =
                          names.length > 1
                            ? names.slice(0, -1).join(", ") +
                              ", and " +
                              names[names.length - 1]
                            : names[0] || "";
                        return (
                          <li key={`relay-${rep.RESULT}`}>
                            {`${nameStr} ran a SB in the ${rep.EVENTNAME.replace(
                              /^(Mens |Womens )/i,
                              "",
                            )} with a SB of ${rep.SCORE}${
                              rep.IMPROVESEASON &&
                              rep.IMPROVESEASON.charAt(0) === "-"
                                ? ` by ${rep.IMPROVESEASON.substring(1)}`
                                : ""
                            }`}
                          </li>
                        );
                      })}
                    </>
                  );
                })()}
              </ul>
            </DialogContent>
          </Paper>
        </TabPanel>
      </TabContext>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default MeetResults;
