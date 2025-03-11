"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

type PageContent = {
  textBlocks: string[];
  // 如果有其他內容（例如 drawings 或 images），可以在這裡添加
  // drawings: string[];
  // images: string[];
};

type SelectedItems = string[];

export default function PageDetail() {
  const router = useRouter();
  const { index } = router.query;
  const [content, setContent] = useState<PageContent | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (index !== undefined) {
      fetchPageContent(Number(index)); // 確保 index 是數字
    }
  }, [index]);

  const fetchPageContent = async (pageIndex: number) => {
    try {
      const res = await fetch('/api/parsePage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIndex }),
      });
      const data: PageContent = await res.json();
      if (res.ok) {
        setContent(data);
      } else {
        setError(data.error || '解析失敗');
      }
    } catch (err) {
      setError('伺服器錯誤');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/exportPdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedItems }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported.pdf';
      a.click();
    } catch (err) {
      setError('匯出失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">內頁內容</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4">
          {content?.textBlocks.map((block, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                checked={selectedItems.includes(block)}
                onChange={() => {
                  setSelectedItems((prev: SelectedItems) =>
                    prev.includes(block)
                      ? prev.filter((item) => item !== block)
                      : [...prev, block]
                  );
                }}
                className="mr-2"
              />
              <span>{block}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          匯出選取內容
        </button>
      </div>
    </div>
  );
}