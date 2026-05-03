import React, { useState, useEffect, useContext } from "react";
import MDBReader from "mdb-reader";
/*export function useDataContext() {
    return useContext(DataContext);
}*/

export const DataContext = React.createContext({});

if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer/").Buffer;
}

function DataContextProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedMeetRows, setSelectedMeetRows] = useState([]);
  const [top10ResultsByEvent, setTop10ResultsByEvent] = useState([]);
  const [prsSBsByEvent, setPrsSBsByEvent] = useState({});
  const [open, setOpen] = useState(false);
  const [meetTable, setMeetTable] = useState([]);
  const [resultsTable, setResultsTable] = useState([]);
  const [athletesTable, setAthletesTable] = useState([]);
  const [relayTable, setRelayTable] = useState([]);
  const [meetInfo, setMeetInfo] = useState(null);

  const requiredTables = [
    "AGEGROUPS",
    "AthInfo",
    "Athlete",
    "ATHRECR",
    "ATHREG",
    "BRACKET",
    "COACHES",
    "CODE",
    "CustomLayout",
    "CustomLayoutFields",
    "CustomLayoutValues",
    "CUSTOMRPTS",
    "ENTRY",
    "ESPLITS",
    "FAVORITES",
    "JOURNAL",
    "MEET",
    "MTEVENT",
    "MTEVENTE",
    "OPTIONS",
    "RECNAME",
    "RECORDS",
    "RELAY",
    "REPORTORDER",
    "RESULT",
    "SPLITS",
    "STDNAME",
    "TEAM",
    "TMREG",
  ];

  const handleFileDrop = (event) => {
    setLoading(true);
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLoading(false);
      try {
        const buffer = Buffer.from(event.target.result);
        const mdbReader = new MDBReader(buffer);
        let tables = mdbReader.getTableNames();

        let containsAllTables = true;
        for (let i = 0; i < requiredTables.length; i++) {
          if (!tables.includes(requiredTables[i])) {
            containsAllTables = false;
            break;
          }
        }

        if (containsAllTables) {
          const athleteTable = mdbReader.getTable("Athlete");
          const meetTable = mdbReader.getTable("MEET");
          const resultTable = mdbReader.getTable("RESULT");
          const relayTableData = mdbReader.getTable("RELAY");
          setMeetTable(meetTable.getData());
          setSelectedMeetRows([]);
          setResultsTable(resultTable);
          setAthletesTable(athleteTable.getData());
          setRelayTable(relayTableData.getData());
          setTop10ResultsByEvent([]);
        } else {
          setMeetTable([
            "This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager",
          ]);
        }
      } catch (error) {
        setMeetTable([]);
        setAthletesTable([]);
        setResultsTable([]);
        setRelayTable([]);
        setFileName(
          "This is not a database file, nor does it appear to be from HYTEK Track and Field Manager",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };
  //The columns to display in the meets table
  const meetTableColumns = [
    { field: "MEET", headerName: "ID", flex: 0.25 },
    { field: "MNAME", headerName: "Meet Name", flex: 1 },
    {
      field: "START",
      headerName: "Date",
      flex: 0.5,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const options = {
          timeZone: "UTC",
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        };
        const formattedDate = date.toLocaleString("en-US", options);
        return formattedDate;
      },
    },
    { field: "LOCATION", headerName: "Location", flex: 1 },
    {
      field: "MEET_KIND",
      headerName: "Meet Type",
      flex: 0.5,
      valueFormatter: (params) => {
        if (params.value === "T") {
          return "Track & Field";
        } else if (params.value === "C") {
          return "Cross Country";
        } else {
          return "";
        }
      },
    },
  ];
  //The columns to display in the athletes table
  const athletesTableColumns = [
    { field: "Athlete", headerName: "ID", flex: 1 },
    { field: "Last", headerName: "Last Name", flex: 1 },
    { field: "First", headerName: "First Name", flex: 1 },
    { field: "Pref", headerName: "Preferred Name", flex: 1 },
    { field: "Sex", headerName: "Gender", flex: 1 },
    { field: "Class", headerName: "Class", flex: 1 },
    { field: "Comp_No", headerName: "Grad Year", flex: 1 },
    { field: "Inactive", headerName: "Inactive", flex: 1 },
  ];

  const meetTableWithId = meetTable.map((row, index) => {
    return {
      ...row,
      id: row.MEET, //This is telling which column has the unique ID, otherwise you cannot display the data grid
    };
  });
  const athletesTableWithId = athletesTable.map((row, index) => {
    return {
      ...row,
      id: row.Athlete, //This is telling which column has the unique ID, otherwise you cannot display the data grid
    };
  });
  const handleClose = () => {
    setOpen(false);
  };
  const compareRawScores = (
    currentScore,
    currentScore_YD,
    comparedScore,
    comparedScore_YD,
    isFieldEvent,
  ) => {
    //currentScore would be at the current meet
    //currentScore_YD carries the imperial or metric from currentScore
    //comparedScore should be from a previous meet
    //comparedScore_YD carries the imperial or metric from comparedScore
    //Will return true if currentScore is better (less than)
    let currentScoreMetric,
      comparedScoreMetric,
      currentTime,
      comparedTime,
      deltaMilliseconds,
      deltaTime,
      deltaDistance;
    if (isFieldEvent) {
      //This is a field event
      currentScoreMetric = convertRawScoreToMark(currentScore, currentScore_YD);
      comparedScoreMetric = convertRawScoreToMark(
        comparedScore,
        comparedScore_YD,
      );
      deltaDistance = convertRawScoreToMark(
        comparedScoreMetric.rawMetric - currentScoreMetric.rawMetric,
        "metric",
      );
    } else {
      //This is a track event and is measured with time
      currentTime = convertRawScoreToMark(currentScore, "M");
      comparedTime = convertRawScoreToMark(comparedScore, "M");
      deltaMilliseconds =
        (currentTime.minutes - comparedTime.minutes) * 60000 +
        (currentTime.seconds - comparedTime.seconds) * 1000 +
        (currentTime.milliseconds - comparedTime.milliseconds);
      deltaTime = convertRawScoreToMark(deltaMilliseconds, "milliseconds");
    }

    return {
      better: currentScoreMetric < comparedScoreMetric, //Used to denote the result in which it was measured in
      deltaMilliseconds: deltaMilliseconds,
      deltaTime: deltaTime,
      deltaDistance: deltaDistance,
    };
  };
  const findBestImprov = (baseResultRow) => {
    let diff = null;
    let bestResult = null;
    let bestRow = null;
    resultsTable.getData().forEach((selectedRow) => {
      //First we need to get all the info from the meets table
      const baseMeet =
        meetTable &&
        meetTable.find((meetTable) => meetTable.MEET === baseResultRow.MEET);
      const selectedMeet =
        meetTable &&
        meetTable.find((meetTable) => meetTable.MEET === selectedRow.MEET);
      if (
        selectedRow.ATHLETE === baseResultRow.ATHLETE &&
        selectedRow.DISTANCE === baseResultRow.DISTANCE &&
        baseMeet.START > selectedMeet.START &&
        selectedRow.I_R === "I" &&
        baseResultRow.I_R === "I" &&
        selectedRow.EVENT === baseResultRow.EVENT
      ) {
        /*Reminder: ATHLETE is the Athlete ID, DISTANCE is the race distance, START is the the meet's start date
         * selectedRow.I_R is either a regular individual race (I), split time (N), or an entire relay (R)
         * EVENT is the type of event it is (dash, run, pole vault, etc)
         * We will only compare time if the IDs of the athletes are the same,
         * the distance of the race is the same
         * this meet's date (START) is larger than the other
         * and that each event is an individual event, as opposed to a relay split
         */
        if (selectedRow.DISTANCE === 0) {
          //This must be a field event
          if (!bestResult || selectedRow.SORT_ID < bestResult) {
            bestResult = selectedRow.SORT_ID;
            diff = compareRawScores(
              baseResultRow.SCORE,
              baseResultRow.MARK_YD,
              selectedRow.SCORE,
              selectedRow.MARK_YD,
              true,
            );
            bestRow = selectedRow;
          }
        } else {
          if (!bestResult || selectedRow.SCORE < bestResult) {
            bestResult = selectedRow.SCORE;
            diff = compareRawScores(
              baseResultRow.SCORE,
              "M",
              selectedRow.SCORE,
              "M",
              false,
            );
            bestRow = selectedRow;
          }
        }
      }
    });
    return { diff, bestRow };
  };
  const metricToImperial = (meters) => {
    //Must already meet in meters.
    let feet = meters * 3.28084;
    let inches = (feet - Math.floor(feet)) * 12;
    if (inches === 12.0) {
      feet += 1;
      inches = 0;
    } else {
      inches = Math.round(inches / 0.25) * 0.25; // round to nearest quarter inch
    }
    let convert = `${Math.floor(feet).toFixed(0)}-${inches.toFixed(2)}`;
    return {
      formatted: convert, //The formatted string
      feet: feet,
      inches: inches,
    };
  };
  const convertRawScoreToMark = (score, MARK_YD) => {
    //Score is the raw score from the database.
    //MARK_YD is either E for imperial or M for metric.
    let mark, convert, rawMetric;
    let minutes, seconds, milliseconds;
    let isFieldEvent;
    if (score === 0 && MARK_YD != "metric") {
      mark = "F";
    } else if (score < 0 && MARK_YD === "E") {
      //Imperial Scored Field Event
      const feet = Math.floor(Math.floor((score * -1) / 100) / 12);
      const inches = ((score * -1) / 100) % 12;
      convert =
        (Math.floor((feet * 12 + inches) * 1000 * 0.0254) / 1000).toFixed(3) +
        "m";
      rawMetric = (feet * 12 + inches) * 0.0254;
      let inchString = inches.toFixed(2);
      if (inchString.length === 4) {
        inchString = "0" + inchString;
      }
      mark = `${Math.floor(feet)}-${inchString}`;
      isFieldEvent = true;
    } else if (score < 0 && MARK_YD === "M") {
      //Metric Scored Field Event
      const meters = (score * -1) / 100;
      rawMetric = meters;
      mark = `${meters.toFixed(2)}m`;
      convert = metricToImperial(meters).formatted;
      isFieldEvent = true;
    } else if (MARK_YD === "metric") {
      //This is a field event which was scored in meters direclty.
      //Typically ran because the score was converted to meters before this method
      if (score === 0) {
        //If score is 0, then we don't want it to be "F"
        rawMetric = "";
        convert = "";
      } else {
        rawMetric = score;
        mark = `${score.toFixed(2)}m`;
        convert = metricToImperial(rawMetric);
      }
    } else if (MARK_YD === "milliseconds") {
      //This is a timed event which was scored in milliseconds.
      //Typically ran because the score was converted to milliseconds before this method
      let negative = score < 0;
      if (negative) {
        score *= -1; //We have to do calculations as postive.
      }
      minutes = Math.floor(score / 60000);
      seconds = Math.floor((score % 60000) / 1000);
      milliseconds = score % 1000;
      if (milliseconds > 99) {
        milliseconds -= 900;
        //There was a weird bug that milliseconds would be 900 higher than it should be
      }
      const showMinutes = minutes >= 1;
      mark = `${showMinutes ? `${minutes}:${String(seconds).padStart(2, "0")}` : String(seconds)}.${String(milliseconds).padStart(2, "0")}`; //We don't need to format seconds unless there is minutes with any leading zeros
      if (negative) {
        mark = "-" + mark;
      }
    } else {
      //Timed event
      const scoreInSeconds = score / 100;
      minutes = Math.floor(scoreInSeconds / 60);
      seconds = Math.floor(scoreInSeconds % 60);
      milliseconds = score % 100;
      const showMinutes = minutes >= 1;
      mark = `${showMinutes ? `${minutes}:${String(seconds).padStart(2, "0")}` : String(seconds)}.${String(milliseconds).padStart(2, "0")}`;
    }
    return {
      mark: mark, //Used to denote the result in which it was measured in
      convert: convert, //Used to denote the result in which it was converted to
      rawMetric: rawMetric, //Use to help with calculating improvement
      isFieldEvent: isFieldEvent,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
    };
  };
  const mapRowToResult = (
    row,
    index,
    athletesTable,
    showImprov,
    relayTable = [],
  ) => {
    const { mark, convert, rawMetric, isFieldEvent } = convertRawScoreToMark(
      row.SCORE,
      row.MARK_YD,
    );
    let improve = null;
    if (showImprov) {
      //We only want to show improve if we are displaying this data for the meets table.
      //Otherwise, it will be too slow and isn't needed.
      improve = findBestImprov(row);
    }
    let improveConvert;
    if (
      improve != null &&
      improve.diff != null &&
      improve.diff.deltaTime != null
    ) {
      improve = improve.diff.deltaTime.mark;
    } else if (
      improve != null &&
      improve.diff != null &&
      improve.diff.deltaDistance != null
    ) {
      //If this is a field event
      improveConvert = improve.diff.deltaDistance.convert.formatted;
      improve = improve.diff.deltaDistance.mark;
    } else {
      improve = "";
    }
    let eventName = "";
    let eventType = null;
    switch (row.I_R) {
      case "I":
        eventType = "Individual";
        break;
      case "R":
        eventType = "Relay";
        break;
      case "N":
        eventType = "Relay Split";
        break;
      default:
        eventType = "";
        break;
    }
    switch (row.EVENT) {
      case 1:
        eventName = row.DISTANCE + "M Dash";
        break;
      case 2:
        eventName = row.DISTANCE + "M Run";
        break;
      case 3:
        eventName = row.DISTANCE / 10 + " Mile Run";
        break;
      case 5:
        eventName = row.DISTANCE + "M Hurdles";
        break;
      case 9:
        eventName = "High Jump";
        break;
      case 10:
        eventName = "Pole Vault";
        break;
      case 11:
        eventName = "Long Jump";
        break;
      case 12:
        eventName = "Triple Jump";
        break;
      case 13:
        eventName = "Shot Put";
        break;
      case 14:
        eventName = "Discus";
        break;
      case 15:
        eventName = "Hammer";
        break;
      case 16:
        eventName = "Javelin";
        break;
      case 17:
        eventName = "Weight Throw";
        break;
      case 19:
        eventName = "4x" + row.DISTANCE / 4 + "M Relay";
        break;
      case 31:
        eventName = "Super Weight";
        break;
      default:
        eventName = "?UNKOWN?";
        break;
    }
    let relayAthletes = [];
    let relayGenderStr = "";
    if (row.I_R === "R") {
      const relayEntry =
        relayTable && relayTable.find((r) => r.RELAY === row.ATHLETE);
      if (!relayEntry) {
        console.log(
          "[Relay debug] No match found. row.ATHLETE =",
          row.ATHLETE,
          "| row.RESULT =",
          row.RESULT,
          "| Sample RELAY table keys:",
          relayTable && relayTable.length > 0
            ? Object.keys(relayTable[0])
            : "empty",
          "| First few RELAY rows:",
          relayTable && relayTable.slice(0, 3),
        );
      }
      if (relayEntry) {
        const athIds = [
          relayEntry["ATH(1)"],
          relayEntry["ATH(2)"],
          relayEntry["ATH(3)"],
          relayEntry["ATH(4)"],
        ].filter((id) => id != null && id !== 0 && id !== "");
        relayAthletes = athIds
          .map((athId) => {
            const ath =
              athletesTable && athletesTable.find((a) => a.Athlete === athId);
            if (!ath) return null;
            return {
              FIRST: ath.Pref || ath.First,
              LAST: ath.Last,
              GRADYEAR: ath.Comp_No,
            };
          })
          .filter(Boolean);
        const firstAthId = athIds[0];
        const firstAth =
          firstAthId != null &&
          athletesTable &&
          athletesTable.find((a) => a.Athlete === firstAthId);
        relayGenderStr =
          firstAth && firstAth.Sex === "M"
            ? "Mens"
            : firstAth && firstAth.Sex === "F"
              ? "Womens"
              : "";
      }
    }
    return {
      id: index,
      //Below concatenates the last name and first name with a comma
      //ATHLETE: athletesTable && athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.Last + ', ' + athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.First,
      FIRST:
        (athletesTable &&
          athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
            ?.Pref) ||
        (athletesTable &&
          athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
            ?.First),
      LAST:
        athletesTable &&
        athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)?.Last,
      GENDER:
        athletesTable &&
        (athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
          ?.Sex === "M"
          ? "Mens"
          : athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
                ?.Sex === "F"
            ? "Womens"
            : ""),
      GRADYEAR:
        athletesTable &&
        athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
          ?.Comp_No,
      //GradYear will be stored as the Comp_No column.
      ATHLETEID: row.ATHLETE,
      EVENTNAME:
        (row.I_R === "R"
          ? relayGenderStr
          : athletesTable &&
            (athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
              ?.Sex === "M"
              ? "Mens"
              : athletesTable.find((athlete) => athlete.Athlete === row.ATHLETE)
                    ?.Sex === "F"
                ? "Womens"
                : "")) +
        " " +
        eventName,
      RELAYATHLETES: relayAthletes,
      SCORE: mark,
      CONVERT: convert,
      RESULT: row.RESULT,
      EVENTTYPE: eventType,
      IMPROVE: improve,
      IMPROVEIMPERIAL: improveConvert,
      RAWMETRIC: rawMetric,
      ISFIELDEVENT: isFieldEvent,
      SORTID: row.SORT_ID,
      MEETID: row.MEET,
      RAWEVENT: row.EVENT,
      RAWDISTANCE: row.DISTANCE,
    };
  };
  const openResultsTable = (newSelection) => {
    const selectedMeetId = newSelection[0];
    const meet =
      meetTable &&
      meetTable.find((meetTable) => meetTable.MEET === selectedMeetId);
    const meetInfoToBePassedIn = {
      meetName: meet?.MNAME,
      meetDate: meet?.START,
    };
    const meetYear = meet?.START ? new Date(meet.START).getFullYear() : null;
    setMeetInfo(meetInfoToBePassedIn);

    const rawRows = resultsTable
      .getData()
      .filter((row) => row.MEET === selectedMeetId);
    const relaySBCache = {};
    const selectedMeetRows = rawRows.map((row, index) => {
      const mapped = mapRowToResult(
        row,
        index,
        athletesTable,
        true,
        relayTable,
      );
      let improveSeason = "";
      let improveSeasonImperial = "";
      if (row.I_R === "I") {
        const sbResult = findBestImprovInYear(row, meetYear);
        if (sbResult.diff !== null && sbResult.diff.deltaTime != null) {
          improveSeason = sbResult.diff.deltaTime.mark;
        } else if (
          sbResult.diff !== null &&
          sbResult.diff.deltaDistance != null
        ) {
          improveSeasonImperial = sbResult.diff.deltaDistance.convert.formatted;
          improveSeason = sbResult.diff.deltaDistance.mark;
        }
      } else if (row.I_R === "R") {
        if (!relaySBCache[row.RESULT]) {
          const sbResult = findBestRelayImprovInYear(row, meetYear);
          let rImproveSeason = "";
          let rImproveSeasonImperial = "";
          if (sbResult.diff !== null && sbResult.diff.deltaTime != null) {
            rImproveSeason = sbResult.diff.deltaTime.mark;
          } else if (
            sbResult.diff !== null &&
            sbResult.diff.deltaDistance != null
          ) {
            rImproveSeasonImperial =
              sbResult.diff.deltaDistance.convert.formatted;
            rImproveSeason = sbResult.diff.deltaDistance.mark;
          }
          relaySBCache[row.RESULT] = {
            improveSeason: rImproveSeason,
            improveSeasonImperial: rImproveSeasonImperial,
          };
        }
        improveSeason = relaySBCache[row.RESULT].improveSeason;
        improveSeasonImperial = relaySBCache[row.RESULT].improveSeasonImperial;
      }
      return {
        ...mapped,
        IMPROVESEASON: improveSeason,
        IMPROVESEASONIMPERIAL: improveSeasonImperial,
      };
    });

    // --- Build all-time rankings for Top 10s tab ---
    const athleteById = new Map(athletesTable.map((a) => [a.Athlete, a]));
    const getFullEventName = (row) => {
      let eventName = "";
      switch (row.EVENT) {
        case 1:
          eventName = row.DISTANCE + "M Dash";
          break;
        case 2:
          eventName = row.DISTANCE + "M Run";
          break;
        case 3:
          eventName = row.DISTANCE / 10 + " Mile Run";
          break;
        case 5:
          eventName = row.DISTANCE + "M Hurdles";
          break;
        case 9:
          eventName = "High Jump";
          break;
        case 10:
          eventName = "Pole Vault";
          break;
        case 11:
          eventName = "Long Jump";
          break;
        case 12:
          eventName = "Triple Jump";
          break;
        case 13:
          eventName = "Shot Put";
          break;
        case 14:
          eventName = "Discus";
          break;
        case 15:
          eventName = "Hammer";
          break;
        case 16:
          eventName = "Javelin";
          break;
        case 17:
          eventName = "Weight Throw";
          break;
        case 19:
          eventName = "4x" + row.DISTANCE / 4 + "M Relay";
          break;
        case 31:
          eventName = "Super Weight";
          break;
        default:
          return "";
      }
      let gender = "";
      if (row.I_R === "I") {
        const ath = athleteById.get(row.ATHLETE);
        gender = ath?.Sex === "M" ? "Mens" : ath?.Sex === "F" ? "Womens" : "";
      } else if (row.I_R === "R") {
        const rel =
          relayTable && relayTable.find((r) => r.RELAY === row.ATHLETE);
        const ath1 = rel?.["ATH(1)"] ? athleteById.get(rel["ATH(1)"]) : null;
        gender = ath1?.Sex === "M" ? "Mens" : ath1?.Sex === "F" ? "Womens" : "";
      }
      return gender ? `${gender} ${eventName}` : eventName;
    };
    // For relay ranking we use a gender-neutral event key so that rows whose
    // gender cannot be resolved (missing relay/athlete lookup) are still counted.
    const relayRankingKey = (row) => `R|${row.EVENT}|${row.DISTANCE}`;
    const allTimeMap = {};
    const histMap = {};
    resultsTable.getData().forEach((row) => {
      if (row.I_R !== "I" && row.I_R !== "R") return;
      if (!row.SORT_ID || row.SCORE === 0) return;
      const eventName =
        row.I_R === "R" ? relayRankingKey(row) : getFullEventName(row);
      if (!eventName) return;
      let key = row.ATHLETE;
      if (row.I_R === "R") {
        const relEntry =
          relayTable && relayTable.find((r) => r.RELAY === row.ATHLETE);
        key = relEntry?.Team ?? row.ATHLETE;
      }
      const entry = {
        SORT_ID: row.SORT_ID,
        SCORE: row.SCORE,
        MARK_YD: row.MARK_YD,
        ATHLETE: row.ATHLETE,
        RESULT: row.RESULT,
        MEET: row.MEET,
        I_R: row.I_R,
      };
      if (!allTimeMap[eventName]) allTimeMap[eventName] = {};
      if (
        !(key in allTimeMap[eventName]) ||
        entry.SORT_ID < allTimeMap[eventName][key].SORT_ID
      )
        allTimeMap[eventName][key] = entry;
      if (row.MEET !== selectedMeetId) {
        if (!histMap[eventName]) histMap[eventName] = {};
        if (
          !(key in histMap[eventName]) ||
          entry.SORT_ID < histMap[eventName][key].SORT_ID
        )
          histMap[eventName][key] = entry;
      }
    });
    const sortedAllTime = {};
    for (const en in allTimeMap)
      sortedAllTime[en] = Object.values(allTimeMap[en]).sort(
        (a, b) => a.SORT_ID - b.SORT_ID,
      );
    const sortedHist = {};
    for (const en in histMap)
      sortedHist[en] = Object.values(histMap[en]).sort(
        (a, b) => a.SORT_ID - b.SORT_ID,
      );
    const getPrevRecord = (eventName, eventType) => {
      const hist = sortedHist[eventName];
      if (!hist || hist.length === 0) return null;
      const prev = hist[0];
      const { mark } = convertRawScoreToMark(prev.SCORE, prev.MARK_YD);
      const prevMeetRow = meetTable.find((m) => m.MEET === prev.MEET);
      const year = prevMeetRow
        ? new Date(prevMeetRow.START).getFullYear()
        : null;
      if (eventType === "Relay") {
        const rel =
          relayTable && relayTable.find((r) => r.RELAY === prev.ATHLETE);
        const athletes = rel
          ? [rel["ATH(1)"], rel["ATH(2)"], rel["ATH(3)"], rel["ATH(4)"]]
              .filter(Boolean)
              .map((id) => {
                const a = athleteById.get(id);
                return a
                  ? {
                      FIRST: a.Pref || a.First,
                      LAST: a.Last,
                      GRADYEAR: a.Comp_No,
                    }
                  : null;
              })
              .filter(Boolean)
          : [];
        return { mark, year, athletes, isRelay: true };
      } else {
        const a = athleteById.get(prev.ATHLETE);
        return a
          ? {
              mark,
              year,
              athleteName: `${a.Pref || a.First} ${a.Last} '${a.Comp_No}`,
              isRelay: false,
            }
          : { mark, year, athleteName: "Unknown", isRelay: false };
      }
    };
    const annotatedRows = selectedMeetRows.map((row) => {
      if (row.EVENTTYPE !== "Individual" && row.EVENTTYPE !== "Relay")
        return row;
      // Only rank if this result is the athlete's/relay's all-time PR
      let rankKey;
      let key;
      if (row.EVENTTYPE === "Relay") {
        // Use gender-neutral relay ranking key to match allTimeMap
        rankKey = `R|${row.RAWEVENT}|${row.RAWDISTANCE}`;
        const relEntry =
          relayTable && relayTable.find((r) => r.RELAY === row.ATHLETEID);
        key = relEntry?.Team ?? row.ATHLETEID;
      } else {
        rankKey = row.EVENTNAME;
        key = row.ATHLETEID;
      }
      const personalBest = allTimeMap[rankKey]?.[key];
      if (!personalBest || personalBest.SORT_ID < row.SORTID) return row;
      const rankings = sortedAllTime[rankKey] || [];
      const rank = rankings.filter((r) => r.SORT_ID < row.SORTID).length + 1;
      if (rank > 10) return row;
      const prevRecord =
        rank === 1 ? getPrevRecord(row.EVENTNAME, row.EVENTTYPE) : null;
      return { ...row, ALLTIMERANK: rank, PREVRECORD: prevRecord };
    });

    setSelectedMeetRows(annotatedRows);
    setOpen(true);
    return annotatedRows;
  };
  const groupRowsByEventName = (rows) => {
    return rows.reduce((acc, row) => {
      // Group rows by EVENTNAME
      acc[row.EVENTNAME] = acc[row.EVENTNAME] || [];

      // Check whether the athlete is already in the list for the eventName
      const existingRowForAthlete = acc[row.EVENTNAME].find(
        (r) => r.ATHLETEID === row.ATHLETEID,
      );

      if (existingRowForAthlete) {
        // If the athlete is already in the list, update their SORTID if the current row has a lower value
        if (row.SORTID < existingRowForAthlete.SORTID) {
          acc[row.EVENTNAME] = acc[row.EVENTNAME].map((r) =>
            r.ATHLETEID === row.ATHLETEID ? row : r,
          );
        }
      } else {
        // If the athlete is not yet in the list, add the current row
        acc[row.EVENTNAME].push(row);
      }

      return acc;
    }, {});
  };

  const sortAndSelectTop10Rows = (rows) => {
    // Sort rows by SORTID and select the top 10 results
    return rows.sort((a, b) => a.SORTID - b.SORTID).slice(0, 10);
  };
  const gatherPRsSBs = (year) => {
    if (!resultsTable || !resultsTable.getData) return;
    const rawRows = resultsTable.getData();
    // Build a meet year lookup map
    const meetYearMap = {};
    (meetTable || []).forEach((m) => {
      meetYearMap[m.MEET] = m.START ? new Date(m.START).getFullYear() : null;
    });
    // Only individual events
    const indivRaws = rawRows.filter(
      (r) => r.I_R === "I" && r.SORT_ID && r.SCORE !== 0,
    );
    // Relay split rows
    const splitRaws = rawRows.filter(
      (r) => r.I_R === "N" && r.SORT_ID && r.SCORE !== 0,
    );
    const years = [year, year - 1, year - 2, year - 3];
    // For each athlete+event combo, compute all-time PR and per-year season bests
    // Key: athleteId|EVENT|DISTANCE
    const prMap = {}; // best SORT_ID ever
    const sbMaps = {}; // { year: { key: best row } }
    const splitPrMap = {}; // best relay split ever
    const splitSbMaps = {}; // { year: { key: best split row } }
    years.forEach((y) => {
      sbMaps[y] = {};
      splitSbMaps[y] = {};
    });
    indivRaws.forEach((r) => {
      const key = `${r.ATHLETE}|${r.EVENT}|${r.DISTANCE}`;
      const rowYear = meetYearMap[r.MEET];
      if (!prMap[key] || r.SORT_ID < prMap[key].SORT_ID) prMap[key] = r;
      if (years.includes(rowYear)) {
        if (!sbMaps[rowYear][key] || r.SORT_ID < sbMaps[rowYear][key].SORT_ID)
          sbMaps[rowYear][key] = r;
      }
    });
    splitRaws.forEach((r) => {
      const key = `${r.ATHLETE}|${r.EVENT}|${r.DISTANCE}`;
      const rowYear = meetYearMap[r.MEET];
      if (!splitPrMap[key] || r.SORT_ID < splitPrMap[key].SORT_ID)
        splitPrMap[key] = r;
      if (years.includes(rowYear)) {
        if (
          !splitSbMaps[rowYear][key] ||
          r.SORT_ID < splitSbMaps[rowYear][key].SORT_ID
        )
          splitSbMaps[rowYear][key] = r;
      }
    });
    // Collect unique event names and group athletes (include split-only athletes)
    const allKeys = new Set([
      ...Object.keys(prMap),
      ...years.flatMap((y) => Object.keys(sbMaps[y])),
      ...Object.keys(splitPrMap),
      ...years.flatMap((y) => Object.keys(splitSbMaps[y])),
    ]);
    const eventAthleteMap = {}; // eventKey -> { athleteId -> { pr, sbs: {year: row} } }
    const eventNameMap = {}; // eventKey -> display name
    allKeys.forEach((key) => {
      const pr = prMap[key];
      const rep =
        pr ||
        years.map((y) => sbMaps[y][key]).find(Boolean) ||
        splitPrMap[key] ||
        years.map((y) => splitSbMaps[y][key]).find(Boolean);
      if (!rep) return;
      const eventKey = `${rep.EVENT}|${rep.DISTANCE}`;
      if (!eventAthleteMap[eventKey]) eventAthleteMap[eventKey] = {};
      if (!eventNameMap[eventKey]) {
        const mapped = mapRowToResult(rep, 0, athletesTable);
        eventNameMap[eventKey] = mapped.EVENTNAME;
      }
      const athId = rep.ATHLETE;
      const sbs = {};
      const splitSbs = {};
      years.forEach((y) => {
        sbs[y] = sbMaps[y][key]
          ? mapRowToResult(sbMaps[y][key], 0, athletesTable)
          : null;
        splitSbs[y] = splitSbMaps[y][key]
          ? mapRowToResult(splitSbMaps[y][key], 0, athletesTable)
          : null;
      });
      eventAthleteMap[eventKey][athId] = {
        pr: pr ? mapRowToResult(pr, 0, athletesTable) : null,
        sbs,
        splitPr: splitPrMap[key]
          ? mapRowToResult(splitPrMap[key], 0, athletesTable)
          : null,
        splitSbs,
      };
    });
    // Build final structure: athletes sorted by PR SORT_ID
    const result = {};
    Object.entries(eventAthleteMap).forEach(([eventKey, athletes]) => {
      const eventName = eventNameMap[eventKey];
      if (!eventName) return;
      const rows = Object.values(athletes).sort((a, b) => {
        const aSort =
          a.pr?.SORTID ??
          Object.values(a.sbs).find(Boolean)?.SORTID ??
          a.splitPr?.SORTID ??
          Object.values(a.splitSbs).find(Boolean)?.SORTID ??
          Infinity;
        const bSort =
          b.pr?.SORTID ??
          Object.values(b.sbs).find(Boolean)?.SORTID ??
          b.splitPr?.SORTID ??
          Object.values(b.splitSbs).find(Boolean)?.SORTID ??
          Infinity;
        return aSort - bSort;
      });
      result[eventName] = rows;
    });
    setPrsSBsByEvent(result);
  };

  const gatherTop10Results = async () => {
    //TODO: Keep more than 10, if there is a tie.
    if (top10ResultsByEvent.length !== 0) {
      // Only calculate this once
      return;
    }
    const allRows = resultsTable
      .getData()
      .map((row, index) => mapRowToResult(row, index, athletesTable)); //Processes all rows into usable info
    const eventTypes = [...new Set(allRows.map((row) => row.EVENTTYPE))];
    const top10sByEventName = {};
    eventTypes.forEach((eventType) => {
      const eventRows = allRows.filter((row) => row.EVENTTYPE === eventType);
      const groupedRows = groupRowsByEventName(eventRows);
      for (const eventName in groupedRows) {
        top10sByEventName[eventName] = top10sByEventName[eventName] || [];
        top10sByEventName[eventName].push(
          ...sortAndSelectTop10Rows(groupedRows[eventName]),
        );
      }
    });

    for (const eventName in top10sByEventName) {
      top10sByEventName[eventName] = top10sByEventName[eventName].slice(0, 10);
    }

    setTop10ResultsByEvent(top10sByEventName);
    setOpen(true);
  };

  const findBestImprovInYear = (baseResultRow, year) => {
    if (!year) return { diff: null, bestRow: null };
    let diff = null;
    let bestResult = null;
    let bestRow = null;
    resultsTable.getData().forEach((selectedRow) => {
      const baseMeet =
        meetTable &&
        meetTable.find((meetTable) => meetTable.MEET === baseResultRow.MEET);
      const selectedMeet =
        meetTable &&
        meetTable.find((meetTable) => meetTable.MEET === selectedRow.MEET);
      const selectedMeetYear =
        selectedMeet && new Date(selectedMeet.START).getFullYear();
      if (
        selectedRow.ATHLETE === baseResultRow.ATHLETE &&
        selectedRow.DISTANCE === baseResultRow.DISTANCE &&
        baseMeet.START > selectedMeet.START &&
        selectedRow.I_R === "I" &&
        baseResultRow.I_R === "I" &&
        selectedRow.EVENT === baseResultRow.EVENT &&
        selectedMeetYear === year
      ) {
        if (selectedRow.DISTANCE === 0) {
          if (!bestResult || selectedRow.SORT_ID < bestResult) {
            bestResult = selectedRow.SORT_ID;
            diff = compareRawScores(
              baseResultRow.SCORE,
              baseResultRow.MARK_YD,
              selectedRow.SCORE,
              selectedRow.MARK_YD,
              true,
            );
            bestRow = selectedRow;
          }
        } else {
          if (!bestResult || selectedRow.SCORE < bestResult) {
            bestResult = selectedRow.SCORE;
            diff = compareRawScores(
              baseResultRow.SCORE,
              "M",
              selectedRow.SCORE,
              "M",
              false,
            );
            bestRow = selectedRow;
          }
        }
      }
    });
    return { diff, bestRow };
  };

  const findBestRelayImprovInYear = (baseResultRow, year) => {
    if (!year) return { diff: null, bestRow: null };
    let diff = null;
    let bestResult = null;
    let bestRow = null;
    const baseMeet =
      meetTable && meetTable.find((m) => m.MEET === baseResultRow.MEET);
    resultsTable.getData().forEach((selectedRow) => {
      const selectedMeet =
        meetTable && meetTable.find((m) => m.MEET === selectedRow.MEET);
      const selectedMeetYear =
        selectedMeet && new Date(selectedMeet.START).getFullYear();
      if (
        selectedRow.EVENT === baseResultRow.EVENT &&
        selectedRow.DISTANCE === baseResultRow.DISTANCE &&
        selectedRow.I_R === "R" &&
        baseMeet.START > selectedMeet.START &&
        selectedMeetYear === year
      ) {
        if (!bestResult || selectedRow.SCORE < bestResult) {
          bestResult = selectedRow.SCORE;
          diff = compareRawScores(
            baseResultRow.SCORE,
            "M",
            selectedRow.SCORE,
            "M",
            false,
          );
          bestRow = selectedRow;
        }
      }
    });
    return { diff, bestRow };
  };

  const returnPRs = (rows) => {
    console.log(rows);
    return "<ul><li>test</li><li>testing</li></ul>";
  };

  const resultsTableColumns = [
    { field: "LAST", headerName: "Last Name", flex: 1 },
    { field: "FIRST", headerName: "First Name", flex: 1 },
    //{ field: 'ATHLETEID', headerName: 'Athlete ID', flex: 1 },
    { field: "EVENTTYPE", headerName: "Event Type", flex: 1 },
    { field: "EVENTNAME", headerName: "Event Name", flex: 1 },
    { field: "SCORE", headerName: "Mark", flex: 1 },
    { field: "CONVERT", headerName: "Convert", flex: 1 },
    { field: "IMPROVE", headerName: "Improvement", flex: 1 },
    //{ field: 'RAWMETRIC', headerName: 'Raw Metric', flex: 1 },
    { field: "IMPROVEIMPERIAL", headerName: "Improv Convert", flex: 1 },
  ];

  //This is the data that I am willing to make public
  const IDataContext = {
    //lastNoteEvent: lastNoteEvent,
    handleFileDrop: handleFileDrop,
    fileName: fileName,
    meetTable: meetTable,
    meetTableWithId: meetTableWithId,
    meetTableColumns: meetTableColumns,
    openResultsTable: openResultsTable,
    handleClose: handleClose,
    meetInfo: meetInfo,
    selectedMeetRows: selectedMeetRows,
    resultsTableColumns: resultsTableColumns,
    athletesTableWithId: athletesTableWithId,
    athletesTableColumns: athletesTableColumns,
    loading: loading,
    open: open,
    returnPRs: returnPRs,
    gatherTop10Results: gatherTop10Results,
    top10ResultsByEvent: top10ResultsByEvent,
    gatherPRsSBs: gatherPRsSBs,
    prsSBsByEvent: prsSBsByEvent,
    athletesTable: athletesTable,
    //Whatever fields
  };
  const [state, setState] = useState(IDataContext);

  useEffect(() => {
    // Your data context initialization logic goes here
  }, []);

  return (
    <DataContext.Provider value={IDataContext}>{children}</DataContext.Provider>
  );
}

export default DataContextProvider;
