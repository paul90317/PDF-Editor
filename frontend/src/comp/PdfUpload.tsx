'use client';

import React, { useState } from 'react';

interface PdfUploadProps {
  onUploadSuccess: (id: string, pages: string[][]) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMessage('請選擇一個 PDF 檔案。');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess(data.id, data.pages);
      } else if (response.status === 400) {
        const errorData = await response.json();
        setErrorMessage(errorData.detail);
      } else {
        console.error('上傳失敗：', response.statusText);
        setErrorMessage('上傳失敗。請重試。');
      }
    } catch (error) {
      console.error('上傳檔案時發生錯誤：', error);
      setErrorMessage('上傳檔案時發生錯誤。請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex items-center justify-between"> {/* 使用 flex 和 justify-between */}
      <div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? '上傳中...' : '上傳'}
      </button>
      {errorMessage && <p className="text-red-500 text-sm absolute top-0 left-1/2 transform -translate-x-1/2">{errorMessage}</p>}
    </div>
  );
};

export default PdfUpload;