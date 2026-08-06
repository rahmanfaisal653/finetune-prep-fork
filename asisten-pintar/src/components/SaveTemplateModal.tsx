import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  initialPrompt: string;
  onClose: () => void;
  onSave: (template: PromptTemplate) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  initialPrompt,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [category] = useState('Kustom');
  const [icon] = useState('bookmark');

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setTitle(initialPrompt.slice(0, 30) + (initialPrompt.length > 30 ? '...' : ''));
      setDescription('Template dari obrolan RAG AI');
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    const newTemplate: PromptTemplate = {
      id: 'tpl-' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'Template kustom dari obrolan',
      category: category.trim() || 'Kustom',
      prompt: prompt.trim(),
      icon: icon || 'bookmark',
    };

    onSave(newTemplate);
    onClose();
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1e1e24] border border-[#cdc3d0] dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-[#191c1d] dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Tutup"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#e9d5ff] dark:bg-[#4f4062] text-[#6f5092] dark:text-[#d8b4fe] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-[18px]">Simpan Sebagai Template</h3>
            <p className="font-body text-[12px] text-gray-500 dark:text-gray-400">
              Simpan perintah ini ke daftar Template Tersimpan Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-[13px] font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
              Judul Template <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ringkasan Analisis Dokumen"
              className="w-full px-3.5 py-2 rounded-xl border border-[#cdc3d0] dark:border-gray-700 bg-white dark:bg-[#121216] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092]"
            />
          </div>

          <div>
            <label className="block font-body text-[13px] font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
              Deskripsi
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fungsi atau tujuan dari prompt ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#cdc3d0] dark:border-gray-700 bg-white dark:bg-[#121216] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092] resize-none"
            />
          </div>

          <div>
            <label className="block font-body text-[13px] font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
              Prompt (Perintah) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Isi prompt..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#cdc3d0] dark:border-gray-700 bg-white dark:bg-[#121216] text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092] resize-none"
            />
          </div>



          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cdc3d0]/40 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-body text-[14px] font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6f5092] hover:bg-[#573878] text-white font-body text-[14px] font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Ke Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
