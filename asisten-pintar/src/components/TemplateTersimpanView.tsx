import React from 'react';
import { PromptTemplate } from '../types';

interface TemplateTersimpanViewProps {
  templates: PromptTemplate[];
  onUseTemplate: (prompt: string) => void;
  onDeleteTemplate?: (id: string) => void;
  darkMode: boolean;
}

export const TemplateTersimpanView: React.FC<TemplateTersimpanViewProps> = ({
  templates,
  onUseTemplate,
  onDeleteTemplate,
  darkMode,
}) => {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full pt-6 pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-[32px] text-[#6f5092] dark:text-[#d8b4fe]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            save
          </span>
          <h2 className="font-headline text-[28px] md:text-[32px] font-bold text-[#191c1d] dark:text-gray-100">
            Template Tersimpan
          </h2>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-[#1e1e24] border border-[#cdc3d0] dark:border-gray-800 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#cdc3d0] mb-2">
            bookmark_border
          </span>
          <p className="font-body text-[15px] font-semibold text-[#191c1d] dark:text-gray-200">
            Belum ada template tersimpan.
          </p>
          <p className="font-body text-[13px] text-[#4a454f] dark:text-gray-400 mt-1">
            Anda dapat menyimpan prompt dari halaman Obrolan sebagai template.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-[#1e1e24] border border-[#cdc3d0] dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#6f5092] dark:hover:border-[#d8b4fe] transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#d8b4fe]/20 text-[#6f5092] dark:text-[#d8b4fe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {tpl.icon}
                      </span>
                    </div>
                    <h3 className="font-headline text-[18px] font-bold text-[#191c1d] dark:text-gray-100 truncate">
                      {tpl.title}
                    </h3>
                  </div>

                  {onDeleteTemplate && (
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                      title="Hapus template ini"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>

                <p className="font-body text-[13px] text-[#4a454f] dark:text-gray-400 mb-4">
                  {tpl.description}
                </p>

                <div className="bg-[#f3f4f5] dark:bg-[#2e3132] p-3 rounded-lg border border-[#cdc3d0]/30 font-mono text-[12px] text-gray-700 dark:text-gray-300 italic mb-4">
                  "{tpl.prompt}"
                </div>
              </div>

              <button
                onClick={() => onUseTemplate(tpl.prompt)}
                className="w-full py-2.5 bg-[#6f5092] hover:bg-[#573878] text-white rounded-lg font-body text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Gunakan Template Ini
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
