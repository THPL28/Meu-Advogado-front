import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Folder
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';

export const DocumentsPage: React.FC = () => {
  const { documents, setIsUploadDocModalOpen } = useLegalPlatform();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Todos', 'Contratos', 'Peças Processuais', 'Procurações', 'Certidões', 'Provas & Anexos'];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'Todos' && doc.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-emerald-600" />
            Arquivos & Repositório de Documentos
          </h1>
          <p className="text-sm text-muted-foreground/90 mt-1">
            Organização centralizada de minutas, certidões, procurações e peças processuais
          </p>
        </div>

        <button
          onClick={() => setIsUploadDocModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          Anexar Novo Arquivo
        </button>
      </div>

      {/* Bento Grid Folders - Wide Multi-column */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div
          onClick={() => setSelectedCategory('Contratos')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Contratos</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.filter(d => d.category === 'Contratos').length} arquivos
          </p>
        </div>

        <div
          onClick={() => setSelectedCategory('Peças Processuais')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Peças Processuais</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.filter(d => d.category === 'Peças Processuais').length} arquivos
          </p>
        </div>

        <div
          onClick={() => setSelectedCategory('Procurações')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Procurações</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.filter(d => d.category === 'Procurações').length} arquivos
          </p>
        </div>

        <div
          onClick={() => setSelectedCategory('Certidões')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Certidões</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.filter(d => d.category === 'Certidões').length} arquivos
          </p>
        </div>

        <div
          onClick={() => setSelectedCategory('Provas & Anexos')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Provas & Anexos</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.filter(d => d.category === 'Provas & Anexos').length} arquivos
          </p>
        </div>

        <div
          onClick={() => setSelectedCategory('Todos')}
          className="p-5 bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-xs"
        >
          <Folder className="w-8 h-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-bold text-foreground truncate">Todos</h3>
          <p className="text-xs text-muted-foreground/90">
            {documents.length} arquivos totais
          </p>
        </div>

      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-card p-6 rounded-2xl sm:rounded-3xl border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do arquivo ou título..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                <th className="py-3.5 px-3">Documento / Nome</th>
                <th className="py-3.5 px-3">Categoria</th>
                <th className="py-3.5 px-3">Enviado por</th>
                <th className="py-3.5 px-3">Data</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs text-muted-foreground">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-background/80 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground/90 font-mono mt-0.5">{doc.fileName} ({doc.fileSize})</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-muted-foreground font-semibold">{doc.category}</td>
                  <td className="py-4 px-3 text-muted-foreground/90">{doc.uploadedBy}</td>
                  <td className="py-4 px-3 font-mono text-muted-foreground/90">{doc.uploadDate}</td>
                  <td className="py-4 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      doc.statusTag === 'Assinado' || doc.statusTag === 'Finalizado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.statusTag === 'Urgente'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {doc.statusTag}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
