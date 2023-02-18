import React, { useState, useContext } from 'react';
import { DataContext } from '../Contexts/DataContext';
import {
    Paper,
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';

function MeetsTab() {
    const { handleFileDrop,
        fileName,
        meetTable,
        mainTabsValue,
        handleMainTabsChange,
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
        <Paper sx={{ height: '70vh', width: '100%' }}>
            <DataGrid
                rows={meetTableWithId}
                columns={meetTableColumns}
                pageSize={100}
                rowsPerPageOptions={[10]}
                autoPageSize
                sortModel={[{ field: 'START', sort: 'desc' }]}
                onSelectionModelChange={openResultsTable}
            />
        </Paper>
    );
}
export default MeetsTab;