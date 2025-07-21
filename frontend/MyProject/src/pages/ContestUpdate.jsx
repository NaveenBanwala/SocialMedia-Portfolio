import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../Api/AuthContext.jsx";


function ContestUpdate(){



    return (
        <>
        <div className="contest-update-outer h-screen w-screen flex justify-center items-center"> 
            <div  className="inner-div-property h-60 w-60 ">
                <div className="voting-container">

                </div>
                <div></div>
            </div>

        </div>
        </>
    );
}

export default ContestUpdate;