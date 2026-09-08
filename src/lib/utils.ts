import { Category, CategoryBudget, Goal, Transaction, DashboardData } from '../types';

export const formatBRL = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatUSD = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const formatCurrency = (value: number, categoryName?: string) => 
  categoryName === 'Dólar' ? formatUSD(value) : formatBRL(value);

export const formatDateBR = (dateString: string) => 
  new Date(dateString).toLocaleDateString('pt-BR');

export const generateMockData = (): DashboardData => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dateStr = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const categories: Category[] = [
    { id: 'c1', name: 'Felipe', type: 'receita', created_at: new Date().toISOString() },
    { id: 'c2', name: 'Camila', type: 'receita', created_at: new Date().toISOString() },
    { id: 'c3', name: 'Mercado', type: 'despesa_variavel', created_at: new Date().toISOString() },
    { id: 'c4', name: 'Aluguel', type: 'despesa_fixa', created_at: new Date().toISOString() },
    { id: 'c5', name: 'Luz', type: 'despesa_fixa', created_at: new Date().toISOString() },
    { id: 'c6', name: 'Ações', type: 'investimento', created_at: new Date().toISOString() },
    { id: 'c7', name: 'FIIs', type: 'investimento', created_at: new Date().toISOString() },
    { id: 'c8', name: 'Dólar', type: 'investimento', created_at: new Date().toISOString() },
    { id: 'c9', name: 'Outros', type: 'despesa_variavel', created_at: new Date().toISOString() },
  ];

  const budgets: CategoryBudget[] = [
    { id: 'b1', category_id: 'c3', monthly_limit: 1000, alert_threshold_percentage: 85 },
    { id: 'b2', category_id: 'c5', monthly_limit: 300, alert_threshold_percentage: 85 },
  ];

  const goals: Goal[] = [
    { id: 'g1', title: 'Viagem dos Sonhos', target_amount: 15000, current_amount: 8750, deadline: `${currentYear}-12-31` }
  ];

  const transactions: Transaction[] = [
    { id: 't1', user_id: 'u1', created_by: 'Felipe', date: dateStr(5), amount: 8000, type: 'receita', category_id: 'c1', status: 'realized', is_unexpected: false, description: 'Salário Mensal', created_at: new Date().toISOString() },
    { id: 't2', user_id: 'u1', created_by: 'Camila', date: dateStr(5), amount: 6000, type: 'receita', category_id: 'c2', status: 'realized', is_unexpected: false, description: 'Salário Mensal', created_at: new Date().toISOString() },
    { id: 't3', user_id: 'u1', created_by: 'Felipe', date: dateStr(10), amount: 880, type: 'despesa_variavel', category_id: 'c3', status: 'realized', is_unexpected: false, description: 'Compras do mês', created_at: new Date().toISOString() },
    { id: 't4', user_id: 'u1', created_by: 'Camila', date: dateStr(12), amount: 2500, type: 'despesa_fixa', category_id: 'c4', status: 'realized', is_unexpected: false, description: 'Aluguel', created_at: new Date().toISOString() },
    { id: 't5', user_id: 'u1', created_by: 'Felipe', date: dateStr(15), amount: 320, type: 'despesa_fixa', category_id: 'c5', status: 'realized', is_unexpected: true, description: 'Conta de luz alta', created_at: new Date().toISOString() },
    { id: 't6', user_id: 'u1', created_by: 'Camila', date: dateStr(20), amount: 500, type: 'investimento', category_id: 'c6', status: 'realized', is_unexpected: false, description: 'Aporte mensal', created_at: new Date().toISOString() },
    { id: 't7', user_id: 'u1', created_by: 'Felipe', date: dateStr(20), amount: 300, type: 'investimento', category_id: 'c7', status: 'realized', is_unexpected: false, description: 'Aporte FIIs', created_at: new Date().toISOString() },
    { id: 't8', user_id: 'u1', created_by: 'Camila', date: dateStr(20), amount: 100, type: 'investimento', category_id: 'c8', status: 'realized', is_unexpected: false, description: 'Compra USD', created_at: new Date().toISOString() },
    { id: 't9', user_id: 'u1', created_by: 'Felipe', date: dateStr(25), amount: 1200, type: 'despesa_variavel', category_id: 'c9', status: 'projected', is_unexpected: false, description: 'Manutenção Carro (Previsão)', created_at: new Date().toISOString() },
  ];

  return { transactions, categories, budgets, goals };
};

export const isSupabaseConfigured = () => {
  return false; // Sempre usa dados mockados por enquanto
};