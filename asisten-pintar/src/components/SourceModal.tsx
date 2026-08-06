import React from 'react';
import { Citation } from '../types';

interface SourceModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e24] border border-[#cdc3d0] dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#cdc3d0]/40 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#6f5092] dark:text-[#d8b4fe]">
              source
            </span>
            <h3 className="font-headline text-[18px] font-bold text-[#191c1d] dark:text-gray-100">
              Kutipan Dokumen Sumber RAG
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#e9d5ff]/30 dark:bg-[#4f4062]/30 p-3 rounded-lg text-[13px]">
            <div>
              <span className="font-bold text-[#6f5092] dark:text-[#d8b4fe] block">
                {citation.docName}
              </span>
              <span className="text-[#4a454f] dark:text-gray-300 text-[12px]">
                Bagian (Chunk Index): #{citation.chunkIndex}
              </span>
            </div>
            <span className="bg-[#6f5092] text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
              Skor Relevansi: {(citation.score * 100).toFixed(0)}%
            </span>
          </div>

          <div>
            <label className="font-body text-[12px] font-bold text-[#4a454f] dark:text-gray-400 block mb-1">
              Potongan Teks Asli (Excerpt):
            </label>
            <div className="p-4 rounded-xl bg-[#f8f9fa] dark:bg-[#191c1d] border border-[#cdc3d0]/40 dark:border-gray-800 text-[13px] text-[#191c1d] dark:text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
              {citation.excerpt}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6f5092] hover:bg-[#573878] text-white rounded-lg text-[13px] font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
