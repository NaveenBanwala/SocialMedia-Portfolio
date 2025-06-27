import React from 'react';

const ResumeDownload = ({ url }) => (
    <a
    href={url}
    download
    className="bg-[#32a86d] text-white px-4 py-2 rounded shadow hover:bg-[#278b59]"
    >
    Download Resume
    </a>
);

export default ResumeDownload;