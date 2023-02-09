import React from 'react';
import './MeetTable.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LoopIcon from '@mui/icons-material/Loop';

function UploadBox(props) {
    const { loading } = props;

    return (
        <div class="box">
            <div class={"UploadContainer" + (loading ? "" : " done")}>
                {loading ? (
                    <LoopIcon fontSize="large" />
                ) : (
                    <> {/* This is here because a ternary operator has to return a single tag */}
                        <UploadFileIcon fontSize="large" />
                        <p>Drag File Here</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default UploadBox;
