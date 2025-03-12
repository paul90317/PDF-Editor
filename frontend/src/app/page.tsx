'use client';

import React, { useState } from 'react';
import PdfDisplay from '@/comp/PdfDisplay';
import PdfUpload from '@/comp/PdfUpload';

export default function () {
  const [thumbnails, setThumbnails] = useState<string[][]>([]);
  const [id, setId] = useState<string>('');

  const handleUploadSuccess = (id: string, pages: string[][]) => {
    setThumbnails(pages);
    setId(id);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <PdfUpload onUploadSuccess={handleUploadSuccess} />
      </div>
      {thumbnails.length > 0 && ( // 只有當 thumbnails 有內容時才顯示 PdfDisplay
        <div className="flex-1 p-4">
          <PdfDisplay file_id = {id} thumbnails={thumbnails} />
        </div>
      )}
    </div>
  );
}