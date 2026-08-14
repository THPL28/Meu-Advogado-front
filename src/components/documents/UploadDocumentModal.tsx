import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { documentsApi } from '../../services/api';
import { DocumentClassification } from '../../types';

interface UploadDocumentModalProps {
  contractId?: string | number;
  jobId?: string | number;
  onSuccess?: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  contractId: propContractId,
  jobId: propJobId,
  onSuccess,
}) => {
  const { isUploadDocModalOpen, setIsUploadDocModalOpen, refreshData, selectedCaseId } = useLegalPlatform();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Contratos' | 'Peças Processuais' | 'Procurações' | 'Certidões' | 'Provas & Anexos'>('Peças Processuais');
  const [classification, setClassification] = useState<DocumentClassification>('CONFIDENTIAL');
  const [statusTag, setStatusTag] = useState<'Assinado' | 'Em revisão' | 'Finalizado' | 'Urgente'>('Em revisão');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isUploadDocModalOpen) return null;

  const targetJobId = propJobId || selectedCaseId || undefined;
  const targetContractId = propContractId || undefined;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadError(null);
    try {
      if (selectedFile) {
        // Upload to backend secure vault with SHA-256 computation
        await documentsApi.uploadSecureDocument(selectedFile, {
          contractId: targetContractId,
          jobId: targetJobId,
          classification,
        });
      } else {
        // Create mock/fallback doc metadata if no real binary was selected
        const fileObj = new File(['mock content'], fileName || 'Documento.pdf', { type: 'application/pdf' });
        await documentsApi.uploadSecureDocument(fileObj, {
          contractId: targetContractId,
          jobId: targetJobId,
          classification,
        }).catch(async () => {
          await documentsApi.uploadDocument({
            title: title || 'Novo Documento',
            category,
            statusTag,
            fileName: fileName || 'Documento_Juridico.pdf',
            fileSize: fileSize || '1.8 MB',
            fileType: fileName.toLowerCase().endsWith('.docx') ? 'DOCX' : fileName.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'PDF',
          });
        });
      }

      await refreshData();
      if (onSuccess) onSuccess();
      setIsUploadDocModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      setFileName('');
    } catch (err: any) {
      console.error('Failed to upload secure doc:', err);
      setUploadError(err?.message || 'Falha no envio do documento. Verifique permissões e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  Cofre Seguro de Documentos
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Upload com Assinatura SHA-256</h3>
            </div>
          </div>
          <button
            onClick={() => setIsUploadDocModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-border bg-background/50 hover:border-emerald-500/50'
            }`}
          >
            <input
              type="file"
              id="secureFileInput"
              className="hidden"
              onChange={handleFileSelect}
            />
            <label htmlFor="secureFileInput" className="cursor-pointer space-y-2 block">
              <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{fileName} ({fileSize})</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-foreground">Arraste seu arquivo PDF, DOCX ou XLSX aqui</p>
                  <p className="text-xs text-muted-foreground">ou clique para selecionar do seu computador (Máx. 50MB)</p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Título de Identificação</label>
            <input
              type="text"
              required
              placeholder="Ex: Petição Inicial com Procuração Ad Judicia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-600 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Nível de Confidencialidade (LGPD)
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as DocumentClassification)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-600 transition-all font-medium"
              >
                <option value="CONFIDENTIAL">CONFIDENTIAL (Confidencial — Partes)</option>
                <option value="RESTRICTED">RESTRICTED (Restrito — Sigilo Rigoroso)</option>
                <option value="PUBLIC">PUBLIC (Público)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Categoria de Arquivo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-600 transition-all font-medium"
              >
                <option value="Peças Processuais">Peças Processuais</option>
                <option value="Contratos">Contratos & Aditivos</option>
                <option value="Procurações">Procurações</option>
                <option value="Certidões">Certidões</option>
                <option value="Provas & Anexos">Provas & Anexos</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground space-y-1 font-mono">
            <p className="flex items-center gap-1.5 text-foreground font-bold font-sans">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Garantias de Segurança & Custódia Digital
            </p>
            <p>• Cálculo automático do Hash SHA-256 no momento do upload</p>
            <p>• Verificação de vírus e integridade de arquivo</p>
            <p>• Log de auditoria imutável gravado para cada download</p>
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculando Hash & Enviando...
                </>
              ) : (
                'Salvar no Cofre Seguro'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
