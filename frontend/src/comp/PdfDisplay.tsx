'use client';

import React, { useState, useEffect } from 'react';

interface PdfDisplayProps {
  file_id: string;
  thumbnails: string[][];
}

const PdfDisplay: React.FC<PdfDisplayProps> = ({ file_id, thumbnails }) => {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [checkedThumbnails, setCheckedThumbnails] = useState<boolean[][]>([]);

  useEffect(() => {
    if (thumbnails.length > 0) {
      const initialChecked = thumbnails.map((pageThumbnails) =>
        pageThumbnails.slice(1).map(() => true)
      );
      setCheckedThumbnails(initialChecked);
    }
  }, [thumbnails]);

  const handlePageClick = (pageIndex: number) => {
    setSelectedPage(pageIndex);
  };

  const handleThumbnailCheckboxChange = (index: number) => {
    if (selectedPage !== null) {
      setCheckedThumbnails((prevChecked) => {
        const newChecked = prevChecked.map((pageChecked, pageIndex) => {
          if (pageIndex === selectedPage) {
            return pageChecked.map((checked, thumbnailIndex) =>
              thumbnailIndex === index ? !checked : checked
            );
          }
          return pageChecked;
        });
        return newChecked;
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/process/${file_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkedThumbnails),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${file_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to export PDF:', response.statusText);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-end p-4">
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export
        </button>
      </div>
      <div className="flex flex-grow">
        <div className="w-1/4 p-4 border-r overflow-y-auto">
          {thumbnails.map((thumbnail, index) => (
            <img
              key={index}
              src={`/img/${thumbnail[0]}`}
              alt={`Page ${index + 1}`}
              onClick={() => handlePageClick(index)}
              className={`cursor-pointer mb-2 ${
                selectedPage === index ? 'border-2 border-blue-500' : ''
              }`}
            />
          ))}
        </div>
        <div className="w-3/4 p-4 overflow-y-auto">
          {selectedPage !== null && (
            <div>
              <div>Page {selectedPage + 1} Content</div>
              <div className="flex flex-wrap">
                {thumbnails[selectedPage].slice(1).map((thumbnailSrc, index) => (
                  <div key={index} className="m-2">
                    <label className="flex flex-col items-center">
                      <input
                        type="checkbox"
                        value={index}
                        checked={checkedThumbnails?.[selectedPage]?.[index] || false}
                        onChange={() => handleThumbnailCheckboxChange(index)}
                      />
                      <img
                        src={`/img/${thumbnailSrc}`}
                        alt={`Thumbnail ${index + 1}`}
                        className="mt-2"
                        style={{maxHeight: '100px', maxWidth:'100px'}}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfDisplay;