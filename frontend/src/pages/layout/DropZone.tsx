import React, { useState } from 'react';

interface DropZoneProps {
    onFilesDropped: (files: File[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped }) => {
    const [dragging, setDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files) as File[]; // Convert FileList to File[]
        onFilesDropped(files);
    };

    return (
        <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: '2px dashed #ccc',
                borderRadius: '5px',
                padding: '20px',
                textAlign: 'center'
            }}
        >
            <div>Drop files here</div>
        </div>
    );
};

export default DropZone;
