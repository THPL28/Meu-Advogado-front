import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { documentsApi } from '../../services/api';

export const UploadDocumentModal: React.FC = () => {
  const { isUploadDocModalOpen, setIsUploadDocModalOpen, refreshData } = useLegalPlatform();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Contratos' | 'Peças Processuais' | 'Procurações' | 'Certidões' | 'Provas & Anexos'>('Peças Processuais');
  const [statusTag, setStatusTag] = useState<'Assinado' | 'Em revisão' | 'Finalizado' | 'Urgente'>('Em revisão');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isUploadDocModalOpen) return null;

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await documentsApi.uploadDocument({
        title,
        category,
        statusTag,
        fileName: fileName || 'Documento_Juridico.pdf',
        fileSize: fileSize || '1.8 MB',
        fileType: fileName.toLowerCase().endsWith('.docx') ? 'DOCX' : fileName.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'PDF'
      });

      await refreshData();
      setIsUploadDocModalOpen(false);
    } catch (err) {
      console.error('Failed to upload doc:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Upload de Documento</h3>
              <p className="text-xs text-muted-foreground/90">Anexe peças, certidões ou procurações com validação de hash</p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadDocModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleSimulatedDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-border bg-background/50 hover:border-border-strong'
            }`}
          >
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileSelect}
            />
            <label htmlFor="fileInput" className="cursor-pointer space-y-2 block">
              <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{fileName} ({fileSize})</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-foreground">Arraste seu arquivo PDF, DOCX ou XLSX aqui</p>
                  <p className="text-xs text-muted-foreground/90">ou clique para selecionar do seu computador (Máx. 50MB)</p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Título de Identificação</label>
            <input
              type="text"
              required
              placeholder="Ex: Parecer Técnico do Consultor Financeiro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Categoria de Arquivo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                <option value="Contratos">Contratos</option>
                <option value="Peças Processuais">Peças Processuais</option>
                <option value="Procurações">Procurações</option>
                <option value="Certidões">Certidões</option>
                <option value="Provas & Anexos">Provas & Anexos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Status do Documento</label>
              <select
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                <option value="Em revisão">Em revisão</option>
                <option value="Assinado">Assinado</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUploadDocModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {submitting ? 'Anexando...' : 'Anexar e Salvar Documento'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
