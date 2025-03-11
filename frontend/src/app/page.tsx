"use client";

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null); // 明確指定 file 的類型
  const [thumbnails, setThumbnails] = useState<string[]>([]); // 明確指定 thumbnails 的類型
  const [error, setError] = useState<string>(''); // 明確指定 error 的類型

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // 確保 files[0] 存在
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('請選擇一個 PDF 檔案');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setThumbnails(data.thumbnails);
        setError('');
      } else {
        setError(data.error || '上傳失敗');
      }
    } catch (err) {
      setError('伺服器錯誤');
    }
  };

  const handleSelectPage = (index: number) => {
    // 跳轉到內頁解析頁面
    window.location.href = `/page/${index}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">上傳 PDF 檔案</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            上傳
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {thumbnails.map((thumbnail, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <img
                src={thumbnail}
                alt={`Page ${index + 1}`}
                className="w-full h-auto rounded"
              />
              <button
                onClick={() => handleSelectPage(index)}
                className="w-full mt-2 bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
              >
                選擇此頁
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}