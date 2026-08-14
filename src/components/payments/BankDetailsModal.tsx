import React, { useState } from 'react';
import { X, Building2, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

export const BankDetailsModal: React.FC = () => {
  const { isBankDetailsModalOpen, setIsBankDetailsModalOpen, user, saveLawyerBankInfo } = useLegalPlatform();

  const bankInfo = user?.lawyerWallet?.bankInfo;

  const [pixKeyType, setPixKeyType] = useState<any>(bankInfo?.pixKeyType || 'CPF');
  const [pixKey, setPixKey] = useState(bankInfo?.pixKey || user?.cpfCnpj || user?.email || '');
  const [bankName, setBankName] = useState(bankInfo?.bankName || '');
  const [accountType, setAccountType] = useState<any>(bankInfo?.accountType || 'CORRENTE');
  const [agency, setAgency] = useState(bankInfo?.agency || '');
  const [accountNumber, setAccountNumber] = useState(bankInfo?.accountNumber || '');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isBankDetailsModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveLawyerBankInfo({
        pixKeyType,
        pixKey,
        bankName,
        accountType,
        agency,
        accountNumber
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsBankDetailsModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar dados bancários:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Cadastrar Dados Bancários para Recebimento</h3>
              <p className="text-[11px] text-muted-foreground/90">Chave PIX e conta corrente do advogado responsável</p>
            </div>
          </div>
          <button
            onClick={() => setIsBankDetailsModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-foreground">Dados Atualizados com Sucesso!</h4>
            <p className="text-xs text-muted-foreground/90">Seus saques PIX serão direcionados para esta chave cadastrada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            {/* PIX Key Section */}
            <div className="p-3.5 bg-background border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/90 uppercase tracking-wider">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Chave PIX para Resgate Rápido</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo de Chave</label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value as any)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="ALEATORIA">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor da Chave PIX</label>
                  <input
                    type="text"
                    required
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Ex: 321.654.987-00"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Instituição Bancária</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Selecione o banco...</option>
                  <option value="Banco Itaú Unibanco S.A.">Banco Itaú Unibanco S.A. (341)</option>
                  <option value="Banco Bradesco S.A.">Banco Bradesco S.A. (237)</option>
                  <option value="Banco do Brasil S.A.">Banco do Brasil S.A. (001)</option>
                  <option value="Banco Santander Brasil">Banco Santander Brasil (033)</option>
                  <option value="Nu Pagamentos S.A. (Nubank)">Nu Pagamentos S.A. - Nubank (260)</option>
                  <option value="Banco Inter S.A.">Banco Inter S.A. (077)</option>
                  <option value="Caixa Econômica Federal">Caixa Econômica Federal (104)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo de Conta</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600"
                  >
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Conta Poupança</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Agência</label>
                  <input
                    type="text"
                    required
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="0001"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 font-mono focus:bg-card focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Número da Conta</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="12345-6"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 font-mono focus:bg-card focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Titularidade validada automaticamente com a OAB e CPF/CNPJ do perfil.</span>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBankDetailsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {submitting ? 'Salvando...' : 'Salvar Dados Bancários'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
