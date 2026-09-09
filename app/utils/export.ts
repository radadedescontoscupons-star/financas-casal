import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ===== EXPORTAR PARA EXCEL =====
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Dados') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// ===== EXPORTAR PARA PDF =====
export const exportToPDF = (data: any[], filename: string, title: string) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Data
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
  
  // Tabela
  const headers = Object.keys(data[0] || {});
  const rows = data.map((item) => Object.values(item));
  
  (doc as any).autoTable({
    startY: 40,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [11, 31, 51] },
    styles: { fontSize: 9 },
  });
  
  doc.save(`${filename}.pdf`);
};

// ===== FORMATAR DADOS PARA EXPORTAÇÃO =====
export const formatTransactionsForExport = (transactions: any[], categories: any[]) => {
  return transactions.map((t) => ({
    Data: t.date,
    Quem: t.created_by,
    Tipo: t.type === 'receita' ? 'Receita' : t.type === 'despesa_fixa' ? 'Despesa Fixa' : t.type === 'despesa_variavel' ? 'Despesa Variável' : t.type === 'investimento' ? 'Investimento' : 'Reserva',
    Categoria: categories.find((c) => c.id === t.category_id)?.name || 'N/A',
    Descrição: t.description || '',
    Valor: t.amount,
    Status: t.status === 'realized' ? 'Realizado' : 'Previsão',
    Imprevisto: t.is_unexpected ? 'Sim' : 'Não',
  }));
};

export const formatGoalsForExport = (goals: any[]) => {
  return goals.map((g) => ({
    Meta: g.title,
    'Valor Objetivo': g.target_amount,
    'Total Acumulado': g.totalAcumulado,
    Aportes: g.totalAportes,
    Rendimentos: g.totalRendimentos,
    'Percentual': `${g.percentage.toFixed(1)}%`,
    'Faltam': g.remaining,
    'Meta Mensal': g.monthly_target || 0,
  }));
};

export const formatPatrimonyForExport = (assets: any[], liabilities: any[]) => {
  return [
    ...assets.map((a) => ({
      Tipo: 'Ativo',
      Nome: a.name,
      Proprietário: a.owner,
      Valor: a.value,
    })),
    ...liabilities.map((l) => ({
      Tipo: 'Passivo',
      Nome: l.name,
      Proprietário: l.owner,
      Valor: l.value,
    })),
  ];
};