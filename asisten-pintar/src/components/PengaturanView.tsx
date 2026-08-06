import React, { useState } from 'react';
import { AISettings } from '../types';

interface PengaturanViewProps {
  settings: AISettings;
  onSaveSettings: (newSettings: AISettings) => void;
  darkMode: boolean;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  onSaveSettings,
  darkMode,
}) => {
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [modelName, setModelName] = useState(settings.modelName);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(settings.googleDriveConnected);

  const [availableModels, setAvailableModels] = useState<{value: string, label: string}[]>(
    settings.modelName ? [{ value: settings.modelName, label: settings.modelName }] : []
  );
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState('');

  const handleFetchModels = async () => {
    if (!serverUrl || !apiKey) {
      setModelError('Harap isi Alamat Server dan API Key terlebih dahulu.');
      return;
    }
    setIsLoadingModels(true);
    setModelError('');
    try {
      const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
      const res = await fetch(`/api/models`, {
        headers: {
          'X-Server-Url': baseUrl,
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Gagal mengambil model (${res.status})`);
      }
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
         const models = data.data.map((m: any) => ({
           value: m.id,
           label: m.id
         }));
         setAvailableModels(models);
         if (models.length > 0 && !models.find((m: any) => m.value === modelName)) {
           setModelName(models[0].value);
         }
      } else {
         throw new Error("Format respons tidak valid");
      }
    } catch (err: any) {
      setModelError(err.message);
    } finally {
      setIsLoadingModels(false);
    }
  };
  const [driveFolder, setDriveFolder] = useState(settings.driveFolder || 'G:\\My Drive\\Colab Notebooks');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDriveExpanded, setIsDriveExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      serverUrl,
      modelName,
      apiKey,
      googleDriveConnected,
      driveFolder,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full pt-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-[#191c1d] dark:text-gray-100 mb-2">
          <span className="material-symbols-outlined text-3xl text-[#6f5092] dark:text-[#d8b4fe]">
            settings
          </span>
          <h2 className="font-headline text-[28px] md:text-[32px] font-bold">
            Pengaturan
          </h2>
        </div>
        <p className="text-[#4a454f] dark:text-gray-400 font-body text-[15px] md:text-[16px]">
          Atur koneksi ke sistem AI Anda
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-body text-[14px] font-semibold">
            Pengaturan server AI berhasil disimpan!
          </span>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forms (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1e1e24] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#cdc3d0]/40 dark:border-gray-800 p-6 md:p-8 transition-colors">
            {/* Form Header */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[#cdc3d0]/40 dark:border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-[#d8b4fe] text-[#604283] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">language</span>
              </div>
              <div>
                <h3 className="font-headline text-[20px] font-semibold text-[#191c1d] dark:text-gray-100">
                  Koneksi Server AI
                </h3>
                <p className="font-body text-[14px] text-[#4a454f] dark:text-gray-400">
                  Pengaturan koneksi utama
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Field */}
              <div>
                <label className="flex items-center gap-2 font-body text-[13px] font-semibold text-[#191c1d] dark:text-gray-200 mb-2">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  Alamat Server (URL)
                </label>
                <input
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full bg-[#f3f4f5] dark:bg-[#2e3132] border border-[#cdc3d0] dark:border-gray-700 rounded-lg px-4 py-3 font-body text-[14px] text-[#191c1d] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092]"
                  placeholder="http://43.159.43.50:20128/v1"
                />
                <p className="mt-1 font-body text-[11px] text-[#4a454f] dark:text-gray-400">
                  Biasanya tidak perlu diubah
                </p>
              </div>

              {/* API Key Field */}
              <div>
                <label className="flex items-center gap-2 font-body text-[13px] font-semibold text-[#191c1d] dark:text-gray-200 mb-2">
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  Kunci Rahasia (API Key)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 w-full bg-[#f3f4f5] dark:bg-[#2e3132] border border-[#cdc3d0] dark:border-gray-700 rounded-lg px-4 py-3 font-body text-[14px] text-[#191c1d] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092]"
                    placeholder="sk-c60b5b633b8ba408-ekg39z-70bf55ae"
                  />
                  <button
                    type="button"
                    onClick={handleFetchModels}
                    disabled={isLoadingModels}
                    className="bg-[#24292e] hover:bg-[#343a40] text-white px-4 py-2 rounded-lg font-body text-[13px] transition-colors disabled:opacity-50"
                  >
                    {isLoadingModels ? 'Memuat...' : 'Muat Model'}
                  </button>
                </div>
                <p className="mt-1 font-body text-[11px] text-[#4a454f] dark:text-gray-400">
                  Seperti kata sandi — jangan disebarkan
                </p>
                {modelError && (
                  <p className="mt-1 font-body text-[12px] text-red-500">{modelError}</p>
                )}
              </div>

              {/* Model Name Field */}
              <div>
                <label className="flex items-center gap-2 font-body text-[13px] font-semibold text-[#191c1d] dark:text-gray-200 mb-2">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  Nama Model AI
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-[#f3f4f5] dark:bg-[#2e3132] border border-[#cdc3d0] dark:border-gray-700 rounded-lg px-4 py-3 font-body text-[14px] text-[#191c1d] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] focus:border-[#6f5092] cursor-pointer"
                >
                  {!availableModels.some((m) => m.value === modelName) && (
                    <option value={modelName}>{modelName}</option>
                  )}
                  {availableModels.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} ({m.value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#6f5092] hover:bg-[#573878] text-white rounded-xl font-headline text-[16px] font-semibold shadow-[0_4px_14px_rgba(111,80,146,0.25)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                  check
                </span>
                Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Guides & Integrations (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Integration Card: Google Drive */}
          <div className="bg-white dark:bg-[#1e1e24] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#cdc3d0]/40 dark:border-gray-800 p-5 transition-colors">
            <div
              onClick={() => setIsDriveExpanded(!isDriveExpanded)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f3f4f5] dark:bg-[#2e3132] flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[#F4B400] text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    folder
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-[16px] font-semibold text-[#191c1d] dark:text-gray-100">
                    Google Drive
                  </h4>
                  <p className="font-body text-[12px] text-[#4a454f] dark:text-gray-400">
                    Opsional — untuk mengambil file dari Drive
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#4a454f] dark:text-gray-400 group-hover:text-[#6f5092] transition-colors">
                {isDriveExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </div>

            {isDriveExpanded && (
              <div className="mt-4 pt-4 border-t border-[#cdc3d0]/40 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[13px] font-medium text-[#191c1d] dark:text-gray-200">
                    Status Koneksi Drive:
                  </span>
                  <button
                    onClick={() => setGoogleDriveConnected(!googleDriveConnected)}
                    className={`px-3 py-1 rounded-full text-[12px] font-bold transition-colors ${
                      googleDriveConnected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {googleDriveConnected ? 'Terhubung' : 'Belum Terhubung'}
                  </button>
                </div>

                <div>
                  <label className="font-body text-[12px] text-[#4a454f] dark:text-gray-400 block mb-1">
                    Folder Drive Default:
                  </label>
                  <input
                    type="text"
                    value={driveFolder}
                    onChange={(e) => setDriveFolder(e.target.value)}
                    className="w-full bg-[#f3f4f5] dark:bg-[#2e3132] border border-[#cdc3d0] dark:border-gray-700 rounded-lg px-3 py-2 font-body text-[13px] text-[#191c1d] dark:text-gray-100"
                    placeholder="Path Google Drive..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
