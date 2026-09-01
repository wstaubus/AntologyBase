import React, { useState, useEffect } from 'react';
import { NovelProject, BackupSnapshot } from '../types';
import { getBackupSnapshots, calculateStorageUsage, saveBackupSnapshot } from '../utils/autoSaveManager';

interface SyncModalProps {
  project: NovelProject;
  onClose: () => void;
  onRestoreDefaults: () => void;
  onForceSave?: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  project,
  onClose,
  onRestoreDefaults,
  onForceSave = () => {},
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string>('Agora mesmo');
  const [backups, setBackups] = useState<BackupSnapshot[]>(() => getBackupSnapshots());
  const storageInfo = calculateStorageUsage();

  const handleManualSync = () => {
    setSyncing(true);
    onForceSave();
    const updatedBackups = saveBackupSnapshot(project, 'manual');
    setBackups(updatedBackups);
    setTimeout(() => {
      setSyncing(false);
      setSyncedAt(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 600);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `${project.title.toLowerCase().replace(/\s+/g, '_')}_backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">cloud_sync</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Salvamento & Backup Local
            </h2>
          </div>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Status Card */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold">Manuscrito Protegido com Auto-Save</p>
              <p className="text-[11px] text-emerald-700">
                Última persistência segura: {syncedAt} • Armazenamento: {storageInfo.formatted}
              </p>
            </div>
          </div>

          {/* Project Stats Summary */}
          <div className="p-3 bg-[#eaeef2] rounded-lg border border-[#c5c6ce] text-[#44474d] grid grid-cols-2 gap-2 text-[11px]">
            <p><strong>Capítulos:</strong> {project.chapters.length}</p>
            <p><strong>Cenas:</strong> {project.chapters.reduce((a, c) => a + c.scenes.length, 0)}</p>
            <p><strong>Personagens:</strong> {project.characters.length}</p>
            <p><strong>Locais:</strong> {project.locations.length}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="py-2.5 px-3 bg-[#04162e] text-white rounded font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${syncing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              {syncing ? 'Salvando...' : 'Salvar / Sincronizar'}
            </button>

            <button
              onClick={handleDownloadBackup}
              className="py-2.5 px-3 bg-[#f6fafe] border border-[#c5c6ce] text-[#04162e] rounded font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#eaeef2] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Baixar Backup .JSON
            </button>
          </div>

          {/* Backup Snapshots History */}
          <div className="pt-2">
            <h3 className="font-bold text-[#04162e] mb-2 flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
              Pontos de Restauração Recentes (Snapshots)
            </h3>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {backups.length > 0 ? (
                backups.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-2 bg-[#f8fafc] border border-[#c5c6ce]/70 rounded text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-blue-600">
                        {snap.trigger === 'manual' ? 'save' : snap.trigger === 'focus_mode' ? 'center_focus_strong' : 'schedule'}
                      </span>
                      <span className="font-mono font-semibold text-[#04162e]">{snap.timestamp}</span>
                      <span className="text-gray-500">
                        ({snap.trigger === 'manual' ? 'Manual' : snap.trigger === 'focus_mode' ? 'Modo Foco' : 'Auto-Save'})
                      </span>
                    </div>
                    <span className="font-mono text-[#04162e] font-semibold">
                      {snap.totalWords} palavras
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic py-1 text-center">Nenhum snapshot gravado ainda.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#eaeef2]">
            <button
              onClick={() => {
                if (confirm('Deseja restaurar o projeto com os dados originais de demonstração de "O Grande Romance"?')) {
                  onRestoreDefaults();
                  onClose();
                }
              }}
              className="text-red-700 hover:text-red-900 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              Restaurar Dados Originais de Demonstração
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-3 border-t border-[#c5c6ce]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#eaeef2] text-[#04162e] rounded font-semibold text-xs hover:bg-[#dfe3e7] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

