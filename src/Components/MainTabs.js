import React, { useState, useContext } from 'react';
import '../css/App.css';
import UploadBox from './UploadBox';
import {
    TabContext,
    TabPanel,
    TabList
} from '@mui/lab/';
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
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';
import { DataContext } from '../Contexts/DataContext';
import MeetsTab from './MeetsTab';
import MeetResults from './MeetResults';
import AthletesTab from './AthletesTab';



function MainTabs() {

    const [mainTabsValue, setMainTabsValue] = React.useState(1);

    const handleMainTabsChange = (event, newValue) => {
        //This code is ran once to set the tabs to the first tab.
        setMainTabsValue(newValue);
    };


    React.useEffect(() => {
        setMainTabsValue("1");
    }, []);

    const { handleFileDrop,
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
    } = useContext(DataContext);
    return (
        <div className="MeetTable" style={{ width: '80vw' }} onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
            {fileName ? `Table data for ${fileName}:` : "Drop a file to display table data"}
            {meetTable.length > 0 ? (
                <>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <TabContext value={mainTabsValue}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleMainTabsChange} aria-label="lab API tabs example">
                                    <Tab label="Meets" value="1" />
                                    <Tab label="Athletes" value="2" />
                                </TabList>
                            </Box>
                            <TabPanel value="1">
                                {/*if the first tab is selected, then the meets will show up here*/}
                                <MeetsTab />
                                <MeetResults /> {/*Only shows if the MeetsTab is clicked*/}
                            </TabPanel>
                            <TabPanel value="2">
                                {/*if the first tab is selected, then athlete info will show up here*/}
                                <AthletesTab />
                            </TabPanel>
                        </TabContext>
                    </Box>
                </>
            ) : (
                <UploadBox loading={loading} />
            )}
        </div>
    );
}

export default MainTabs;