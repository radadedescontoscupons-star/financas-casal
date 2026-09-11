'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Check, AlertTriangle, TrendingUp, Wallet, Calendar, User, X, Target, Briefcase, PiggyBank, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, BarChart3, DollarSign, Download, FileSpreadsheet, FileText, LogOut, Bell } from 'lucide-react';
import { supabase } from './supabase';
import { exportToExcel, exportToPDF, formatTransactionsForExport, formatGoalsForExport, formatPatrimonyForExport } from './utils/export';

// ===== UTILITÁRIOS =====
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatUSD = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatCurrency = (value: number, categoryName?: string) =>
  categoryName === 'Dólar' ? formatUSD(value) : formatBRL(value);

const formatDateBR = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
};

// ===== DADOS MOCKADOS =====
const generateMockData = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const dateStr = (day: number) => `${y}-${m}-${String(day).padStart(2, '0')}`;

  return {
    categories: [
      { id: 'c1', name: 'Felipe', type: 'receita' },
      { id: 'c2', name: 'Camila', type: 'receita' },
      { id: 'c3', name: 'Salário', type: 'receita' },
      { id: 'c4', name: 'Freelance', type: 'receita' },
      { id: 'c5', name: 'Dividendos', type: 'receita' },
      { id: 'c6', name: 'Outros', type: 'receita' },
      { id: 'c7', name: 'Aluguel', type: 'despesa_fixa' },
      { id: 'c8', name: 'Condomínio', type: 'despesa_fixa' },
      { id: 'c9', name: 'Luz', type: 'despesa_fixa' },
      { id: 'c10', name: 'Gás', type: 'despesa_fixa' },
      { id: 'c11', name: 'Água', type: 'despesa_fixa' },
      { id: 'c12', name: 'Internet', type: 'despesa_fixa' },
      { id: 'c13', name: 'IPTU', type: 'despesa_fixa' },
      { id: 'c14', name: 'Seguro', type: 'despesa_fixa' },
      { id: 'c15', name: 'Escola', type: 'despesa_fixa' },
      { id: 'c16', name: 'Mensalidade', type: 'despesa_fixa' },
      { id: 'c17', name: 'Mercado', type: 'despesa_variavel' },
      { id: 'c18', name: 'Farmácia', type: 'despesa_variavel' },
      { id: 'c19', name: 'Obra', type: 'despesa_variavel' },
      { id: 'c20', name: 'Casa', type: 'despesa_variavel' },
      { id: 'c21', name: 'Transporte', type: 'despesa_variavel' },
      { id: 'c22', name: 'Restaurante', type: 'despesa_variavel' },
      { id: 'c23', name: 'Lazer', type: 'despesa_variavel' },
      { id: 'c24', name: 'Vestuário', type: 'despesa_variavel' },
      { id: 'c25', name: 'Beleza', type: 'despesa_variavel' },
      { id: 'c26', name: 'Pet', type: 'despesa_variavel' },
      { id: 'c27', name: 'Cartão de Crédito', type: 'despesa_variavel' },
      { id: 'c28', name: 'Outros', type: 'despesa_variavel' },
      { id: 'c29', name: 'Ações', type: 'investimento' },
      { id: 'c30', name: 'FIIs', type: 'investimento' },
      { id: 'c31', name: 'Renda Fixa', type: 'investimento' },
      { id: 'c32', name: 'Dólar', type: 'investimento' },
      { id: 'c33', name: 'Cripto', type: 'investimento' },
      { id: 'c34', name: 'Tesouro Direto', type: 'investimento' },
      { id: 'c35', name: 'Outros', type: 'investimento' },
      { id: 'c36', name: 'Reserva de Emergência', type: 'reserva' },
      { id: 'c37', name: 'Fundo de Viagem', type: 'reserva' },
      { id: 'c38', name: 'Outros', type: 'reserva' },
    ],
    budgets: [
      { id: 'b1', category_id: 'c17', monthly_limit: 1000, alert_threshold_percentage: 85 },
      { id: 'b2', category_id: 'c9', monthly_limit: 300, alert_threshold_percentage: 85 },
    ],
    goals: [
      { id: 'g1', title: '🏠 Nossa Casa', icon: '🏠', goal_type: 'imovel', target_amount: 500000, current_amount: 87500, monthly_target: 3000 },
      { id: 'g2', title: '✈️ Viagem', icon: '✈️', goal_type: 'viagem', target_amount: 25000, current_amount: 12000, monthly_target: 1500 },
      { id: 'g3', title: '🚗 Carro', icon: '🚗', goal_type: 'veiculo', target_amount: 80000, current_amount: 15000, monthly_target: 2000 },
      { id: 'g4', title: '🛡️ Reserva Financeira', icon: '🛡️', goal_type: 'reserva', target_amount: 50000, current_amount: 30000, monthly_target: 1000 },
      { id: 'g5', title: '🎓 Educação', icon: '🎓', goal_type: 'educacao', target_amount: 40000, current_amount: 8000, monthly_target: 800 },
    ],
    transactions: [
      { id: 't1', created_by: 'Felipe', date: dateStr(5), amount: 8000, type: 'receita', category_id: 'c1', status: 'realized', is_unexpected: false, description: 'Salário Mensal' },
      { id: 't2', created_by: 'Camila', date: dateStr(5), amount: 6000, type: 'receita', category_id: 'c2', status: 'realized', is_unexpected: false, description: 'Salário Mensal' },
      { id: 't3', created_by: 'Felipe', date: dateStr(10), amount: 880, type: 'despesa_variavel', category_id: 'c17', status: 'realized', is_unexpected: false, description: 'Compras do mês' },
      { id: 't4', created_by: 'Camila', date: dateStr(12), amount: 2500, type: 'despesa_fixa', category_id: 'c7', status: 'realized', is_unexpected: false, description: 'Aluguel' },
      { id: 't5', created_by: 'Felipe', date: dateStr(15), amount: 320, type: 'despesa_fixa', category_id: 'c9', status: 'realized', is_unexpected: true, description: 'Conta de luz alta' },
      { id: 't6', created_by: 'Camila', date: dateStr(20), amount: 500, type: 'investimento', category_id: 'c29', status: 'realized', is_unexpected: false, description: 'Aporte mensal' },
      { id: 't7', created_by: 'Felipe', date: dateStr(20), amount: 300, type: 'investimento', category_id: 'c30', status: 'realized', is_unexpected: false, description: 'Aporte FIIs' },
      { id: 't8', created_by: 'Camila', date: dateStr(20), amount: 100, type: 'investimento', category_id: 'c32', status: 'realized', is_unexpected: false, description: 'Compra USD' },
      { id: 't9', created_by: 'Felipe', date: dateStr(25), amount: 1200, type: 'despesa_variavel', category_id: 'c6', status: 'projected', is_unexpected: false, description: 'Manutenção Carro (Previsão)' },
    ],
    goalContributions: [
      { goal_id: 'g1', contribution_type: 'aporte', amount: 80000, date: dateStr(1), description: 'Aporte inicial' },
      { goal_id: 'g1', contribution_type: 'rendimento', amount: 7500, date: dateStr(15), description: 'Rendimentos' },
      { goal_id: 'g2', contribution_type: 'aporte', amount: 12000, date: dateStr(5), description: 'Economias viagem' },
    ],
    assets: [
      { id: 'a1', asset_type: 'conta', name: 'Conta Corrente Felipe', value: 5400, owner: 'Felipe' },
      { id: 'a2', asset_type: 'conta', name: 'Conta Corrente Camila', value: 3200, owner: 'Camila' },
      { id: 'a3', asset_type: 'investimento', name: 'Investimentos Felipe', value: 15000, owner: 'Felipe' },
      { id: 'a4', asset_type: 'investimento', name: 'Investimentos Camila', value: 12000, owner: 'Camila' },
      { id: 'a5', asset_type: 'reserva', name: 'Reserva de Emergência', value: 30000, owner: 'família' },
      { id: 'a6', asset_type: 'fgts', name: 'FGTS Felipe', value: 25000, owner: 'Felipe' },
      { id: 'a7', asset_type: 'fgts', name: 'FGTS Camila', value: 18000, owner: 'Camila' },
    ],
    liabilities: [
      { id: 'l1', liability_type: 'cartao', name: 'Cartão de Crédito', value: 2500, owner: 'família' },
      { id: 'l2', liability_type: 'financiamento', name: 'Financiamento Carro', value: 45000, owner: 'família' },
      { id: 'l3', liability_type: 'emprestimo', name: 'Empréstimo Pessoal', value: 8000, owner: 'Felipe' },
    ],
    patrimonyHistory: [
      { id: 'p1', month: '2025-09-01', total_assets: 80000, total_liabilities: 20000, net_patrimony: 60000 },
      { id: 'p2', month: '2025-12-01', total_assets: 95000, total_liabilities: 22000, net_patrimony: 73000 },
      { id: 'p3', month: '2026-03-01', total_assets: 112000, total_liabilities: 25000, net_patrimony: 87000 },
      { id: 'p4', month: '2026-06-01', total_assets: 128000, total_liabilities: 28000, net_patrimony: 100000 },
      { id: 'p5', month: '2026-09-01', total_assets: 142000, total_liabilities: 30000, net_patrimony: 112000 },
    ],
    cashFlowHistory: [
      { month: '2026-04-01', income: 13000, expenses: 3200, contributions: 700 },
      { month: '2026-05-01', income: 14000, expenses: 3500, contributions: 800 },
      { month: '2026-06-01', income: 14500, expenses: 3800, contributions: 850 },
      { month: '2026-07-01', income: 14000, expenses: 3600, contributions: 900 },
      { month: '2026-08-01', income: 14200, expenses: 3700, contributions: 920 },
      { month: '2026-09-01', income: 14000, expenses: 3700, contributions: 900 },
    ],
  };
};

// ===== COMPONENTES UI PREMIUM =====
function Card({ children, className = '', gold = false }: any) {
  return (
    <div className={`card-premium ${gold ? 'card-gold' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'default' }: any) {
  const styles: any = {
    default: 'bg-slate-100 text-slate-700',
    realized: 'bg-green-100 text-green-800',
    projected: 'bg-slate-50 text-slate-600 border border-dashed border-slate-300',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    unexpected: 'bg-orange-100 text-orange-800',
    gold: 'bg-[#A9823A]/10 text-[#A9823A]',
    navy: 'bg-[#0B1F33]/10 text-[#0B1F33]',
    success: 'bg-[#2F6B57]/10 text-[#2F6B57]',
  };
  return <span className={`badge-premium ${styles[variant]}`}>{children}</span>;
}

function ProgressBar({ value, color = 'bg-[#0B1F33]' }: any) {
  return (
    <div className="progress-premium">
      <div className={`progress-premium-fill ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

// ===== TELA DE LOGIN =====
function LoginScreen({ onLogin }: { onLogin: (user: string) => void }) {
  const [selectedUser, setSelectedUser] = useState<'Felipe' | 'Camila'>('Felipe');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === '1234' || password === '') {
      localStorage.setItem('currentUser', selectedUser);
      onLogin(selectedUser);
    } else {
      alert('Senha incorreta! Use 1234 ou deixe vazio.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0B1F33] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-[#C5A45A]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#0B1F33] mb-2">Finanças do Casal</h1>
          <p className="text-[#707780]">Gestão Patrimonial</p>
        </div>

        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-[#0B1F33] mb-6">Quem está acessando?</h2>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setSelectedUser('Felipe')}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedUser === 'Felipe'
                  ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                  : 'border-[#0B1F33]/20 hover:border-[#0B1F33]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center text-white font-bold">F</div>
                <div className="text-left">
                  <p className="font-bold text-[#0B1F33]">Felipe</p>
                  <p className="text-xs text-[#707780]">Acessar como Felipe</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedUser('Camila')}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedUser === 'Camila'
                  ? 'border-[#A9823A] bg-[#A9823A]/5'
                  : 'border-[#0B1F33]/20 hover:border-[#0B1F33]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#A9823A] rounded-full flex items-center justify-center text-white font-bold">C</div>
                <div className="text-left">
                  <p className="font-bold text-[#0B1F33]">Camila</p>
                  <p className="text-xs text-[#707780]">Acessar como Camila</p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-[#0B1F33]">Senha (opcional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234 ou deixe vazio"
              className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-[#0B1F33] hover:bg-[#172a3d] text-white font-semibold py-3 rounded-lg transition-colors border border-[#A9823A]/30"
          >
            Entrar
          </button>
        </Card>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function FinanceDashboard() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goalContributions, setGoalContributions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [patrimonyHistory, setPatrimonyHistory] = useState<any[]>([]);
  const [cashFlowHistory, setCashFlowHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flow' | 'health' | 'goals' | 'investments' | 'patrimony'>('dashboard');
  const [patrimonyView, setPatrimonyView] = useState<'family' | 'Felipe' | 'Camila'>('family');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'realized' | 'projected'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'Felipe' | 'Camila'>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState<any>({
    created_by: 'Felipe',
    type: 'despesa_variavel',
    category_id: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    status: 'realized',
    is_unexpected: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    setFormData((prev: any) => ({ ...prev, created_by: user }));
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

    const loadData = async () => {
    setLoading(true);
    try {
      const { data: catsData, error: catsError } = await supabase.from('categories').select('*');
      
      if (catsError) {
        console.warn('Erro ao conectar com Supabase, iniciando vazio:', catsError);
        // Se der erro de conexão, inicia tudo vazio
        setCategories([]);
        setBudgets([]);
        setGoals([]);
        setTransactions([]);
        setGoalContributions([]);
        setAssets([]);
        setLiabilities([]);
        setPatrimonyHistory([]);
        setCashFlowHistory([]);
        setUseMockData(true);
      } else {
        // Se conectar, puxa os dados. Se não tiver nada no banco, vem vazio []
        setCategories(catsData || []);
        
        const { data: budgetData } = await supabase.from('category_budgets').select('*');
        setBudgets(budgetData || []);
        
        const { data: goalsData } = await supabase.from('goals').select('*');
        setGoals(goalsData || []);
        
        const { data: transData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        setTransactions(transData || []);
        
        const { data: contributionsData } = await supabase.from('goal_contributions').select('*');
        setGoalContributions(contributionsData || []);
        
        const { data: assetsData } = await supabase.from('assets').select('*');
        setAssets(assetsData || []);
        
        const { data: liabilitiesData } = await supabase.from('liabilities').select('*');
        setLiabilities(liabilitiesData || []);
        
        const { data: historyData } = await supabase.from('patrimony_history').select('*').order('month', { ascending: true });
        setPatrimonyHistory(historyData || []);
        
        const { data: cashFlowData } = await supabase.from('cash_flow_history').select('*').order('month', { ascending: true });
        setCashFlowHistory(cashFlowData || []);
        
        setUseMockData(false);
      }
    } catch (error) {
      console.error('Erro geral ao carregar:', error);
      // Em caso de erro inesperado, também inicia vazio
      setCategories([]);
      setBudgets([]);
      setGoals([]);
      setTransactions([]);
      setGoalContributions([]);
      setAssets([]);
      setLiabilities([]);
      setPatrimonyHistory([]);
      setCashFlowHistory([]);
      setUseMockData(true);
    }
    setLoading(false);
  };
  
  const monthlyTransactions = useMemo(() =>
    transactions.filter((t) => t.date && t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const filteredTransactions = useMemo(() =>
    monthlyTransactions
      .filter((t) => {
        if (viewFilter !== 'all' && t.status !== viewFilter) return false;
        if (userFilter !== 'all' && t.created_by !== userFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [monthlyTransactions, viewFilter, userFilter]
  );

  const metrics = useMemo(() => {
    const realizedIncome = monthlyTransactions.filter((t) => t.type === 'receita' && t.status === 'realized').reduce((sum, t) => sum + Number(t.amount), 0);
    const projectedIncome = monthlyTransactions.filter((t) => t.type === 'receita' && t.status === 'projected').reduce((sum, t) => sum + Number(t.amount), 0);
    const realizedExpenses = monthlyTransactions.filter((t) => (t.type === 'despesa_fixa' || t.type === 'despesa_variavel') && t.status === 'realized').reduce((sum, t) => sum + Number(t.amount), 0);
    const unexpectedExpenses = monthlyTransactions.filter((t) => t.is_unexpected && t.status === 'realized').reduce((sum, t) => sum + Number(t.amount), 0);
    const investments = monthlyTransactions.filter((t) => t.type === 'investimento' && t.status === 'realized');
    const totalAportes = investments.reduce((sum, t) => sum + Number(t.amount), 0);
    const investmentTotals = {
      acoes: investments.filter((t) => categories.find((c) => c.id === t.category_id)?.name === 'Ações').reduce((s, t) => s + Number(t.amount), 0),
      fiis: investments.filter((t) => categories.find((c) => c.id === t.category_id)?.name === 'FIIs').reduce((s, t) => s + Number(t.amount), 0),
      dolar: investments.filter((t) => categories.find((c) => c.id === t.category_id)?.name === 'Dólar').reduce((s, t) => s + Number(t.amount), 0),
    };
    const saldo = realizedIncome - realizedExpenses;
    const saldoDisponivel = saldo - totalAportes;
    return { realizedIncome, projectedIncome, realizedExpenses, unexpectedExpenses, totalAportes, saldo, saldoDisponivel, investmentTotals, investments };
  }, [monthlyTransactions, categories]);

  const flowMetrics = useMemo(() => {
    const currentMonth = cashFlowHistory[cashFlowHistory.length - 1];
    const previousMonth = cashFlowHistory[cashFlowHistory.length - 2];
    if (!currentMonth) return { income: 0, expenses: 0, contributions: 0, incomeChange: 0, expensesChange: 0, contributionsChange: 0, balance: 0, history: [] };
    const balance = currentMonth.income - currentMonth.expenses - currentMonth.contributions;
    const incomeChange = previousMonth ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 : 0;
    const expensesChange = previousMonth ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100 : 0;
    const contributionsChange = previousMonth ? ((currentMonth.contributions - previousMonth.contributions) / previousMonth.contributions) * 100 : 0;
    return { income: currentMonth.income, expenses: currentMonth.expenses, contributions: currentMonth.contributions, balance, incomeChange, expensesChange, contributionsChange, history: cashFlowHistory };
  }, [cashFlowHistory]);

  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      const contributions = goalContributions.filter((c) => c.goal_id === goal.id);
      const totalAportes = contributions.filter((c) => c.contribution_type === 'aporte').reduce((sum, c) => sum + Number(c.amount), 0);
      const totalRendimentos = contributions.filter((c) => c.contribution_type === 'rendimento').reduce((sum, c) => sum + Number(c.amount), 0);
      const totalAcumulado = totalAportes + totalRendimentos;
      const percentage = goal.target_amount > 0 ? (totalAcumulado / goal.target_amount) * 100 : 0;
      const remaining = goal.target_amount - totalAcumulado;
      return { ...goal, totalAportes, totalRendimentos, totalAcumulado, percentage, remaining };
    });
  }, [goals, goalContributions]);

  const patrimonyMetrics = useMemo(() => {
    const filteredAssets = patrimonyView === 'family' ? assets : assets.filter((a) => a.owner === patrimonyView || a.owner === 'família');
    const filteredLiabilities = patrimonyView === 'family' ? liabilities : liabilities.filter((l) => l.owner === patrimonyView || l.owner === 'família');
    const totalAssets = filteredAssets.reduce((sum, a) => sum + Number(a.value), 0);
    const totalLiabilities = filteredLiabilities.reduce((sum, l) => sum + Number(l.value), 0);
    const netPatrimony = totalAssets - totalLiabilities;
    const currentMonthPatrimony = patrimonyHistory[patrimonyHistory.length - 1];
    const previousMonthPatrimony = patrimonyHistory[patrimonyHistory.length - 2];
    const patrimonyChange = currentMonthPatrimony && previousMonthPatrimony ? currentMonthPatrimony.net_patrimony - previousMonthPatrimony.net_patrimony : 0;
    return { totalAssets, totalLiabilities, netPatrimony, patrimonyChange };
  }, [assets, liabilities, patrimonyHistory, patrimonyView]);

  const healthMetrics = useMemo(() => {
    const expenseRatio = metrics.realizedIncome > 0 ? (metrics.realizedExpenses / metrics.realizedIncome) * 100 : 0;
    const investmentRatio = metrics.realizedIncome > 0 ? (metrics.totalAportes / metrics.realizedIncome) * 100 : 0;
    const hasEmergencyFund = assets.some((a) => a.asset_type === 'reserva' && a.value >= 10000);
    const debtRatio = patrimonyMetrics.totalAssets > 0 ? (patrimonyMetrics.totalLiabilities / patrimonyMetrics.totalAssets) * 100 : 0;
    const goalsProgress = goalsWithProgress.reduce((sum, g) => sum + g.percentage, 0) / (goalsWithProgress.length || 1);
    
    let healthStatus: 'green' | 'yellow' | 'red' = 'green';
    let healthLabel = 'Equilibrada';
    let healthScore = 0;
    const issues: string[] = [];
    const strengths: string[] = [];

    if (expenseRatio <= 60) healthScore += 25;
    else if (expenseRatio <= 80) healthScore += 15;
    else { healthScore += 5; issues.push('Despesas consomem mais de 80% da renda'); }

    if (investmentRatio >= 20) healthScore += 25;
    else if (investmentRatio >= 10) healthScore += 15;
    else { healthScore += 5; issues.push('Aportes abaixo de 10% da renda'); }

    if (hasEmergencyFund) { healthScore += 20; strengths.push('Reserva de emergência constituída'); }
    else { issues.push('Reserva de emergência insuficiente'); }

    if (debtRatio <= 30) { healthScore += 15; strengths.push('Nível de endividamento saudável'); }
    else if (debtRatio <= 50) { healthScore += 8; issues.push('Endividamento moderado'); }
    else { healthScore += 3; issues.push('Endividamento elevado'); }

    if (goalsProgress >= 50) { healthScore += 15; strengths.push('Progresso consistente nas metas'); }
    else if (goalsProgress >= 25) healthScore += 8;
    else { healthScore += 3; issues.push('Metas com baixo progresso'); }

    if (healthScore >= 70) { healthStatus = 'green'; healthLabel = 'Equilibrada'; }
    else if (healthScore >= 40) { healthStatus = 'yellow'; healthLabel = 'Atenção'; }
    else { healthStatus = 'red'; healthLabel = 'Crítica'; }

    return { expenseRatio, investmentRatio, hasEmergencyFund, debtRatio, goalsProgress, healthStatus, healthLabel, healthScore, issues, strengths };
  }, [metrics, assets, patrimonyMetrics, goalsWithProgress]);

  const budgetStatus = useMemo(() =>
    budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.category_id);
      const spent = monthlyTransactions.filter((t) => t.category_id === budget.category_id && t.status === 'realized' && (t.type === 'despesa_fixa' || t.type === 'despesa_variavel')).reduce((sum, t) => sum + Number(t.amount), 0);
      const limit = Number(budget.monthly_limit);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      let alertLevel = 'normal';
      let alertBadge = null;
      if (percentage >= 100) { alertLevel = 'ultrapassado'; alertBadge = 'Ultrapassado'; }
      else if (percentage >= 85) { alertLevel = 'proximo'; alertBadge = 'Limite Próximo'; }
      else if (percentage >= 70) { alertLevel = 'atencao'; alertBadge = 'Atenção'; }
      const remaining = Math.max(0, limit - spent);
      return { category, spent, limit, percentage, alertLevel, alertBadge, remaining };
    }),
    [budgets, categories, monthlyTransactions]
  );

  useEffect(() => {
    if (budgetStatus.length > 0) {
      const alerts = budgetStatus
        .filter((b) => b.alertLevel === 'ultrapassado' || b.alertLevel === 'proximo')
        .map((b) => ({
          id: b.category?.id,
          message: `${b.category?.name}: ${b.alertBadge} (${b.percentage.toFixed(0)}%)`,
          level: b.alertLevel,
        }));
      setNotifications(alerts);
    }
  }, [budgetStatus]);

  const handleExportTransactionsExcel = () => {
    const data = formatTransactionsForExport(filteredTransactions, categories);
    exportToExcel(data, `transacoes_${selectedMonth}`, 'Transações');
  };
  const handleExportTransactionsPDF = () => {
    const data = formatTransactionsForExport(filteredTransactions, categories);
    exportToPDF(data, `transacoes_${selectedMonth}`, 'Relatório de Transações');
  };
  const handleExportGoalsExcel = () => {
    const data = formatGoalsForExport(goalsWithProgress);
    exportToExcel(data, `metas_${selectedMonth}`, 'Metas');
  };
  const handleExportGoalsPDF = () => {
    const data = formatGoalsForExport(goalsWithProgress);
    exportToPDF(data, `metas_${selectedMonth}`, 'Relatório de Metas');
  };
  const handleExportPatrimonyExcel = () => {
    const data = formatPatrimonyForExport(assets, liabilities);
    exportToExcel(data, `patrimonio_${selectedMonth}`, 'Patrimônio');
  };
  const handleExportPatrimonyPDF = () => {
    const data = formatPatrimonyForExport(assets, liabilities);
    exportToPDF(data, `patrimonio_${selectedMonth}`, 'Relatório Patrimonial');
  };

  const handleAddTransaction = async (e: any) => {
    e.preventDefault();
    if (!formData.category_id) { alert('Selecione uma categoria!'); return; }
    if (useMockData) {
      const newTransaction = { id: `t${Date.now()}`, ...formData, amount: parseFloat(formData.amount) };
      setTransactions((prev) => [...prev, newTransaction]);
      setIsDrawerOpen(false);
      setFormData({ created_by: currentUser || 'Felipe', type: 'despesa_variavel', category_id: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '', status: 'realized', is_unexpected: false });
      return;
    }
    try {
      await supabase.from('transactions').insert({ created_by: formData.created_by, date: formData.date, amount: parseFloat(formData.amount), type: formData.type, category_id: formData.category_id, status: formData.status, is_unexpected: formData.is_unexpected, description: formData.description });
      setIsDrawerOpen(false);
      setFormData({ created_by: currentUser || 'Felipe', type: 'despesa_variavel', category_id: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '', status: 'realized', is_unexpected: false });
      await loadData();
    } catch (error: any) { alert(`Erro: ${error?.message}`); }
  };

  const confirmTransaction = async (id: string) => {
    if (useMockData) { setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, status: 'realized' } : t)); return; }
    try { await supabase.from('transactions').update({ status: 'realized' }).eq('id', id); await loadData(); } catch (error) { console.error(error); }
  };

  const availableCategories = categories.filter((c) => c.type === formData.type);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A9823A] mx-auto mb-4"></div>
          <p className="text-[#707780]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-24 font-body">
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-xs">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-3 rounded-lg shadow-lg border ${notif.level === 'ultrapassado' ? 'bg-[#A94B4B] text-white border-[#A94B4B]' : 'bg-[#B8860B] text-white border-[#B8860B]'}`}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{notif.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <header className="header-premium sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#C5A45A]" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#0B1F33]">Finanças do Casal</h1>
                <p className="text-xs text-[#707780]">Olá, {currentUser}! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#F7F5F0] px-3 py-2 rounded-lg border border-[#0B1F33]/10">
                <Calendar className="w-4 h-4 text-[#707780]" />
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-sm bg-transparent outline-none text-[#0B1F33] font-medium" />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 bg-[#F7F5F0] rounded-lg border border-[#0B1F33]/10 hover:bg-[#0B1F33]/5 transition-colors"
                  title="Exportar"
                >
                  <Download className="w-4 h-4 text-[#0B1F33]" />
                </button>
                
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-2xl border border-[#0B1F33]/10 p-2 z-50">
                      <p className="text-xs font-semibold text-[#707780] uppercase px-2 py-1">Transações</p>
                      <button onClick={() => { handleExportTransactionsExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Exportar Excel
                      </button>
                      <button onClick={() => { handleExportTransactionsPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileText className="w-4 h-4 text-[#A94B4B]" /> Exportar PDF
                      </button>
                      
                      <p className="text-xs font-semibold text-[#707780] uppercase px-2 py-1 mt-2">Metas</p>
                      <button onClick={() => { handleExportGoalsExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Exportar Excel
                      </button>
                      <button onClick={() => { handleExportGoalsPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileText className="w-4 h-4 text-[#A94B4B]" /> Exportar PDF
                      </button>
                      
                      <p className="text-xs font-semibold text-[#707780] uppercase px-2 py-1 mt-2">Patrimônio</p>
                      <button onClick={() => { handleExportPatrimonyExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Exportar Excel
                      </button>
                      <button onClick={() => { handleExportPatrimonyPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0B1F33] hover:bg-[#F7F5F0] rounded">
                        <FileText className="w-4 h-4 text-[#A94B4B]" /> Exportar PDF
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-[#F7F5F0] rounded-lg border border-[#0B1F33]/10 hover:bg-[#A94B4B]/10 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-[#A94B4B]" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'dashboard', label: 'Início', icon: Wallet },
              { id: 'flow', label: 'Fluxo', icon: BarChart3 },
              { id: 'health', label: 'Saúde', icon: Activity },
              { id: 'goals', label: 'Metas', icon: Target },
              { id: 'investments', label: 'Investimentos', icon: Briefcase },
              { id: 'patrimony', label: 'Patrimônio', icon: PiggyBank },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#0B1F33] text-white shadow-lg' : 'bg-white text-[#707780] hover:bg-[#0B1F33]/5'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <p className="text-xs text-[#707780] font-medium uppercase tracking-wide">Receitas</p>
                <p className="text-2xl font-bold text-[#2F6B57] mt-2 font-display">{formatBRL(metrics.realizedIncome)}</p>
                {metrics.projectedIncome > 0 && <p className="text-xs text-[#707780] mt-2">+ {formatBRL(metrics.projectedIncome)} previsto</p>}
              </Card>
              <Card className="p-5">
                <p className="text-xs text-[#707780] font-medium uppercase tracking-wide">Despesas</p>
                <p className="text-2xl font-bold text-[#A94B4B] mt-2 font-display">{formatBRL(metrics.realizedExpenses)}</p>
                {metrics.unexpectedExpenses > 0 && (
                  <p className="text-xs text-[#B8860B] mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {formatBRL(metrics.unexpectedExpenses)} imprevistos
                  </p>
                )}
              </Card>
              <Card className="p-5">
                <p className="text-xs text-[#707780] font-medium uppercase tracking-wide">Saldo</p>
                <p className={`text-2xl font-bold mt-2 font-display ${metrics.saldo >= 0 ? 'text-[#0B1F33]' : 'text-[#A94B4B]'}`}>
                  {formatBRL(metrics.saldo)}
                </p>
                <p className="text-xs text-[#707780] mt-2">Receitas − Despesas</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-[#707780] font-medium uppercase tracking-wide">Saldo Disponível</p>
                <p className={`text-2xl font-bold mt-2 font-display ${metrics.saldoDisponivel >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                  {formatBRL(metrics.saldoDisponivel)}
                </p>
                <p className="text-xs text-[#707780] mt-2">Saldo − Aportes</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#A9823A]" />
                  <h3 className="font-display font-bold text-[#0B1F33]">Aportes do Mês</h3>
                </div>
                <p className="text-3xl font-bold text-[#0B1F33] font-display">{formatBRL(metrics.totalAportes)}</p>
                <div className="flex gap-3 mt-4 text-xs text-[#707780]">
                  <span>Ações: {formatBRL(metrics.investmentTotals.acoes)}</span>
                  <span>•</span>
                  <span>FIIs: {formatBRL(metrics.investmentTotals.fiis)}</span>
                  <span>•</span>
                  <span>USD: {formatUSD(metrics.investmentTotals.dolar)}</span>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-[#A9823A]" />
                  <h3 className="font-display font-bold text-[#0B1F33]">Total Investido</h3>
                </div>
                <p className="text-3xl font-bold text-[#0B1F33] font-display">
                  {formatBRL(metrics.investmentTotals.acoes + metrics.investmentTotals.fiis + (metrics.investmentTotals.dolar * 5.5))}
                </p>
                <p className="text-xs text-[#707780] mt-2">{metrics.investments.length} aportes no mês</p>
              </Card>
            </div>

            {/* TETOS DE GASTOS - NOVO VISUAL AZUL MARINHO */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#B8860B]" />
                <h3 className="font-display font-bold text-[#0B1F33]">Tetos de Gastos</h3>
              </div>
              <div className="space-y-4">
                {budgetStatus.map((budget, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#0B1F33] text-white shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-white text-lg">{budget.category?.name}</span>
                      <div className="flex items-center gap-3">
                        {budget.alertBadge && (
                          <span className={`badge-premium ${
                            budget.alertLevel === 'ultrapassado' ? 'bg-[#A94B4B] text-white' : 
                            budget.alertLevel === 'proximo' ? 'bg-[#B8860B] text-white' : 
                            'bg-[#C5A45A] text-white'
                          }`}>
                            {budget.alertBadge}
                          </span>
                        )}
                        <span className="text-sm text-white/80 font-medium">
                          {formatBRL(budget.spent)} / {formatBRL(budget.limit)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-white rounded-full transition-all" 
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }} 
                      />
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-white/70">{budget.percentage.toFixed(0)}% utilizado</p>
                      {budget.alertLevel !== 'ultrapassado' ? (
                        <p className="text-xs text-white/70">Restam {formatBRL(budget.remaining)}</p>
                      ) : (
                        <p className="text-xs text-[#ffaaaa] font-medium">Ultrapassou {formatBRL(budget.spent - budget.limit)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-display font-bold text-[#0B1F33]">Lançamentos</h3>
                <div className="flex gap-2">
                  {(['all', 'Felipe', 'Camila'] as const).map((user) => (
                    <button key={user} onClick={() => setUserFilter(user)} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${userFilter === user ? 'bg-[#0B1F33] text-white' : 'bg-[#F7F5F0] text-[#707780]'}`}>
                      <User className="w-3 h-3" /> {user === 'all' ? 'Todos' : user}
                    </button>
                  ))}
                </div>
              </div>
              {filteredTransactions.length === 0 ? (
                <p className="text-center text-[#707780] py-8 text-sm">Nenhum lançamento encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((t) => {
                    const category = categories.find((c) => c.id === t.category_id);
                    return (
                      <div key={t.id} className="flex justify-between items-start p-4 bg-[#F7F5F0] rounded-lg hover:bg-[#F7F5F0]/80 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.created_by === 'Felipe' ? 'bg-[#0B1F33] text-white' : 'bg-[#A9823A] text-white'}`}>
                            {t.created_by[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#0B1F33]">{t.description || category?.name || 'Sem descrição'}</p>
                            <p className="text-xs text-[#707780] mt-0.5">{formatDateBR(t.date)} • {category?.name}</p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant={t.status === 'realized' ? 'realized' : 'projected'}>
                                {t.status === 'realized' ? 'Realizado' : 'Previsão'}
                              </Badge>
                              {t.is_unexpected && <Badge variant="unexpected">Imprevisto</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm font-display ${t.type === 'receita' ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                            {t.type === 'receita' ? '+' : '-'} {formatCurrency(Number(t.amount), category?.name)}
                          </p>
                          {t.status === 'projected' && (
                            <button onClick={() => confirmTransaction(t.id)} className="mt-2 text-xs flex items-center gap-1 text-[#0B1F33] hover:text-[#A9823A] font-medium bg-white hover:bg-[#A9823A]/10 px-2 py-1 rounded-md transition-colors border border-[#0B1F33]/20">
                              <Check className="w-3 h-3" /> Efetivar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#A9823A]" />
              <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Fluxo Financeiro</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2F6B57]" />
                    <p className="text-xs text-[#707780] font-medium uppercase">Receitas</p>
                  </div>
                  {flowMetrics.incomeChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowDownRight className="w-4 h-4 text-[#A94B4B]" />}
                </div>
                <p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.income)}</p>
                <p className={`text-xs mt-1 ${flowMetrics.incomeChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                  {flowMetrics.incomeChange >= 0 ? '+' : ''}{flowMetrics.incomeChange.toFixed(1)}% vs mês anterior
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-[#A94B4B]" />
                    <p className="text-xs text-[#707780] font-medium uppercase">Despesas</p>
                  </div>
                  {flowMetrics.expensesChange <= 0 ? <ArrowDownRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowUpRight className="w-4 h-4 text-[#A94B4B]" />}
                </div>
                <p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.expenses)}</p>
                <p className={`text-xs mt-1 ${flowMetrics.expensesChange <= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                  {flowMetrics.expensesChange >= 0 ? '+' : ''}{flowMetrics.expensesChange.toFixed(1)}% vs mês anterior
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#A9823A]" />
                    <p className="text-xs text-[#707780] font-medium uppercase">Aportes</p>
                  </div>
                  {flowMetrics.contributionsChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowDownRight className="w-4 h-4 text-[#A94B4B]" />}
                </div>
                <p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.contributions)}</p>
                <p className={`text-xs mt-1 ${flowMetrics.contributionsChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                  {flowMetrics.contributionsChange >= 0 ? '+' : ''}{flowMetrics.contributionsChange.toFixed(1)}% vs mês anterior
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-[#0B1F33]" />
                    <p className="text-xs text-[#707780] font-medium uppercase">Saldo</p>
                  </div>
                </div>
                <p className={`text-2xl font-bold font-display ${flowMetrics.balance >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                  {formatBRL(flowMetrics.balance)}
                </p>
                <p className="text-xs text-[#707780] mt-1">Receitas - Despesas - Aportes</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-display font-bold text-[#0B1F33] mb-6">Evolução Mensal (Últimos 6 meses)</h3>
              <div className="space-y-6">
                {flowMetrics.history.map((item: any, idx: number) => {
                  const balance = item.income - item.expenses - item.contributions;
                  const maxIncome = Math.max(...flowMetrics.history.map((h: any) => h.income));
                  const maxExpenses = Math.max(...flowMetrics.history.map((h: any) => h.expenses));
                  
                  return (
                    <div key={idx} className="space-y-3 p-4 bg-[#F7F5F0] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#0B1F33] font-display">{formatMonthYear(item.month)}</span>
                        <span className={`font-bold font-display ${balance >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                          {formatBRL(balance)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#707780]">Receitas</span>
                          <span className="font-medium text-[#2F6B57]">{formatBRL(item.income)}</span>
                        </div>
                        <ProgressBar value={(item.income / maxIncome) * 100} color="bg-[#2F6B57]" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#707780]">Despesas</span>
                          <span className="font-medium text-[#A94B4B]">{formatBRL(item.expenses)}</span>
                        </div>
                        <ProgressBar value={(item.expenses / maxExpenses) * 100} color="bg-[#A94B4B]" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#707780]">Aportes</span>
                          <span className="font-medium text-[#A9823A]">{formatBRL(item.contributions)}</span>
                        </div>
                        <ProgressBar value={(item.contributions / maxIncome) * 100} color="bg-[#A9823A]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold text-[#0B1F33] mb-4">Análise de Tendência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#2F6B57]/5 rounded-lg border border-[#2F6B57]/20">
                  <p className="text-sm text-[#707780] mb-1">Receitas</p>
                  <p className={`text-lg font-bold font-display ${flowMetrics.incomeChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                    {flowMetrics.incomeChange >= 0 ? '↗' : '↘'} {flowMetrics.incomeChange >= 0 ? 'Crescendo' : 'Diminuindo'}
                  </p>
                  <p className="text-xs text-[#707780] mt-1">{flowMetrics.incomeChange >= 0 ? 'Receitas em alta!' : 'Atenção: receitas em queda'}</p>
                </div>
                <div className="p-4 bg-[#A94B4B]/5 rounded-lg border border-[#A94B4B]/20">
                  <p className="text-sm text-[#707780] mb-1">Despesas</p>
                  <p className={`text-lg font-bold font-display ${flowMetrics.expensesChange <= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                    {flowMetrics.expensesChange <= 0 ? '↘' : '↗'} {flowMetrics.expensesChange <= 0 ? 'Controladas' : 'Aumentando'}
                  </p>
                  <p className="text-xs text-[#707780] mt-1">{flowMetrics.expensesChange <= 0 ? 'Ótimo controle!' : 'Revisar gastos'}</p>
                </div>
                <div className="p-4 bg-[#A9823A]/5 rounded-lg border border-[#A9823A]/20">
                  <p className="text-sm text-[#707780] mb-1">Aportes</p>
                  <p className={`text-lg font-bold font-display ${flowMetrics.contributionsChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                    {flowMetrics.contributionsChange >= 0 ? '↗' : '↘'} {flowMetrics.contributionsChange >= 0 ? 'Aumentando' : 'Diminuindo'}
                  </p>
                  <p className="text-xs text-[#707780] mt-1">{flowMetrics.contributionsChange >= 0 ? 'Investimentos crescendo!' : 'Aumentar aportes'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-[#A9823A]" />
              <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Saúde Financeira</h2>
            </div>
            <Card className={`p-6 ${healthMetrics.healthStatus === 'green' ? 'border-[#2F6B57] bg-[#2F6B57]/5' : healthMetrics.healthStatus === 'yellow' ? 'border-[#B8860B] bg-[#B8860B]/5' : 'border-[#A94B4B] bg-[#A94B4B]/5'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[#707780] font-medium">Classificação</p>
                  <h3 className={`text-3xl font-bold font-display mt-1 ${healthMetrics.healthStatus === 'green' ? 'text-[#2F6B57]' : healthMetrics.healthStatus === 'yellow' ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>
                    {healthMetrics.healthStatus === 'green' ? '🟢' : healthMetrics.healthStatus === 'yellow' ? '🟡' : '🔴'} {healthMetrics.healthLabel}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#707780]">Score</p>
                  <p className="text-4xl font-bold text-[#0B1F33] font-display">{healthMetrics.healthScore}/100</p>
                </div>
              </div>
              <ProgressBar value={healthMetrics.healthScore} color={healthMetrics.healthStatus === 'green' ? 'bg-[#2F6B57]' : healthMetrics.healthStatus === 'yellow' ? 'bg-[#B8860B]' : 'bg-[#A94B4B]'} />
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#2F6B57]" />
                  <h3 className="font-display font-bold text-[#0B1F33]">Indicadores Positivos</h3>
                </div>
                {healthMetrics.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {healthMetrics.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#707780]">
                        <ArrowUpRight className="w-4 h-4 text-[#2F6B57] mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#707780]">Nenhum ponto forte identificado</p>
                )}
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[#A94B4B]" />
                  <h3 className="font-display font-bold text-[#0B1F33]">Pontos de Atenção</h3>
                </div>
                {healthMetrics.issues.length > 0 ? (
                  <ul className="space-y-2">
                    {healthMetrics.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#707780]">
                        <ArrowDownRight className="w-4 h-4 text-[#A94B4B] mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#707780]">Sem pontos de atenção</p>
                )}
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="font-display font-bold text-[#0B1F33] mb-4">Métricas Detalhadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F7F5F0] rounded-lg">
                  <p className="text-xs text-[#707780] mb-1">Despesas/Receita</p>
                  <p className={`text-2xl font-bold font-display ${healthMetrics.expenseRatio <= 60 ? 'text-[#2F6B57]' : healthMetrics.expenseRatio <= 80 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.expenseRatio.toFixed(1)}%</p>
                  <p className="text-xs text-[#707780] mt-1">Ideal: até 60%</p>
                </div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg">
                  <p className="text-xs text-[#707780] mb-1">Aportes/Receita</p>
                  <p className={`text-2xl font-bold font-display ${healthMetrics.investmentRatio >= 20 ? 'text-[#2F6B57]' : healthMetrics.investmentRatio >= 10 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.investmentRatio.toFixed(1)}%</p>
                  <p className="text-xs text-[#707780] mt-1">Ideal: 20%+</p>
                </div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg">
                  <p className="text-xs text-[#707780] mb-1">Dívidas/Ativos</p>
                  <p className={`text-2xl font-bold font-display ${healthMetrics.debtRatio <= 30 ? 'text-[#2F6B57]' : healthMetrics.debtRatio <= 50 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.debtRatio.toFixed(1)}%</p>
                  <p className="text-xs text-[#707780] mt-1">Ideal: até 30%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[#A9823A]" />
              <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Nossos Objetivos</h2>
            </div>
            {goalsWithProgress.map((goal) => (
              <Card key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0B1F33]">{goal.title}</h3>
                    <p className="text-sm text-[#707780] mt-1">Meta: {formatBRL(goal.target_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(goal.totalAcumulado)}</p>
                    <Badge variant="gold">{goal.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <ProgressBar value={goal.percentage} color="bg-[#A9823A]" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#0B1F33]/5 p-3 rounded-lg">
                    <p className="text-xs text-[#707780] font-medium">Aportes</p>
                    <p className="text-lg font-bold text-[#0B1F33] mt-1 font-display">{formatBRL(goal.totalAportes)}</p>
                  </div>
                  <div className="bg-[#A9823A]/5 p-3 rounded-lg">
                    <p className="text-xs text-[#707780] font-medium">Rendimentos</p>
                    <p className="text-lg font-bold text-[#A9823A] mt-1 font-display">{formatBRL(goal.totalRendimentos)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#0B1F33]/10">
                  <p className="text-sm text-[#707780]">Faltam <span className="font-semibold text-[#0B1F33]">{formatBRL(goal.remaining)}</span></p>
                  {goal.monthly_target && <p className="text-sm text-[#707780]">Meta mensal: <span className="font-semibold text-[#0B1F33]">{formatBRL(goal.monthly_target)}</span></p>}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-[#A9823A]" />
              <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Investimentos</h2>
            </div>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0B1F33]/5 p-5 rounded-lg">
                  <p className="text-sm text-[#707780]">Total Aportado</p>
                  <p className="text-3xl font-bold text-[#0B1F33] mt-2 font-display">{formatBRL(metrics.totalAportes)}</p>
                </div>
                <div className="bg-[#A9823A]/5 p-5 rounded-lg">
                  <p className="text-sm text-[#707780]">Rendimentos</p>
                  <p className="text-3xl font-bold text-[#A9823A] mt-2 font-display">{formatBRL(metrics.totalAportes * 0.0644)}</p>
                  <p className="text-xs text-[#A9823A] mt-2 font-medium">+6,44% de rentabilidade</p>
                </div>
              </div>
              <h3 className="font-display font-bold text-[#0B1F33] mb-3">Distribuição</h3>
              <div className="space-y-2">
                {[
                  { name: 'Ações', value: metrics.investmentTotals.acoes, color: 'bg-[#0B1F33]' },
                  { name: 'FIIs', value: metrics.investmentTotals.fiis, color: 'bg-[#A9823A]' },
                  { name: 'Dólar', value: metrics.investmentTotals.dolar, color: 'bg-[#2F6B57]', isUSD: true },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-[#F7F5F0] rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium text-[#0B1F33]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#0B1F33] font-display">{item.isUSD ? formatUSD(item.value) : formatBRL(item.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'patrimony' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-6 h-6 text-[#A9823A]" />
                <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Patrimônio Líquido</h2>
              </div>
              <div className="flex gap-2">
                {(['family', 'Felipe', 'Camila'] as const).map((view) => (
                  <button key={view} onClick={() => setPatrimonyView(view)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${patrimonyView === view ? 'bg-[#0B1F33] text-white' : 'bg-white text-[#707780] border border-[#0B1F33]/10'}`}>
                    {view === 'family' ? 'Família' : view}
                  </button>
                ))}
              </div>
            </div>
            <Card className="p-6 card-gold">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#C5A45A] text-sm font-medium">Patrimônio Líquido</p>
                  <p className="text-4xl font-bold mt-2 font-display">{formatBRL(patrimonyMetrics.netPatrimony)}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${patrimonyMetrics.patrimonyChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                    {patrimonyMetrics.patrimonyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">{patrimonyMetrics.patrimonyChange >= 0 ? '+' : ''}{formatBRL(patrimonyMetrics.patrimonyChange)}</span>
                  </div>
                  <p className="text-xs text-[#C5A45A] mt-1">vs mês anterior</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
                  <p className="text-xs text-[#C5A45A]">Ativos</p>
                  <p className="text-xl font-bold mt-1 font-display">{formatBRL(patrimonyMetrics.totalAssets)}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
                  <p className="text-xs text-[#C5A45A]">Passivos</p>
                  <p className="text-xl font-bold mt-1 font-display">{formatBRL(patrimonyMetrics.totalLiabilities)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display font-bold text-[#0B1F33] mb-4">Evolução Patrimonial</h3>
              <div className="space-y-3">
                {patrimonyHistory.map((item) => {
                  const maxPatrimony = Math.max(...patrimonyHistory.map((h) => h.net_patrimony));
                  const percentage = (item.net_patrimony / maxPatrimony) * 100;
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-[#0B1F33]">{formatMonthYear(item.month)}</span>
                        <span className="font-bold text-[#0B1F33] font-display">{formatBRL(item.net_patrimony)}</span>
                      </div>
                      <ProgressBar value={percentage} color="bg-[#0B1F33]" />
                    </div>
                  );
                })}
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-display font-bold text-[#0B1F33] mb-4">Ativos</h3>
                <div className="space-y-2">
                  {assets.filter((a) => patrimonyView === 'family' || a.owner === patrimonyView || a.owner === 'família').map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center p-3 bg-[#F7F5F0] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#0B1F33]">{asset.name}</p>
                        <p className="text-xs text-[#707780]">{asset.owner}</p>
                      </div>
                      <span className="font-bold text-[#2F6B57] font-display">{formatBRL(asset.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-display font-bold text-[#0B1F33] mb-4">Passivos</h3>
                <div className="space-y-2">
                  {liabilities.filter((l) => patrimonyView === 'family' || l.owner === patrimonyView || l.owner === 'família').map((liability) => (
                    <div key={liability.id} className="flex justify-between items-center p-3 bg-[#A94B4B]/5 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#0B1F33]">{liability.name}</p>
                        <p className="text-xs text-[#707780]">{liability.owner}</p>
                      </div>
                      <span className="font-bold text-[#A94B4B] font-display">{formatBRL(liability.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-[#0B1F33] hover:bg-[#172a3d] text-[#C5A45A] rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 border border-[#A9823A]/30">
        <Plus className="w-8 h-8" />
      </button>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1F33]/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-[#0B1F33]/10 p-4 z-10">
              <h2 className="font-display text-lg font-bold text-[#0B1F33]">Novo Lançamento</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-[#F7F5F0] rounded">
                <X className="w-5 h-5 text-[#707780]" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-4 space-y-4 pb-24">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Quem Lançou</label>
                <select value={formData.created_by} onChange={(e) => setFormData({ ...formData, created_by: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]">
                  <option value="Felipe">Felipe</option>
                  <option value="Camila">Camila</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]">
                  <option value="receita">Receita</option>
                  <option value="despesa_fixa">Despesa Fixa</option>
                  <option value="despesa_variavel">Despesa Variável</option>
                  <option value="investimento">Investimento</option>
                  <option value="reserva">Reserva</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Categoria</label>
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]">
                  <option value="">Selecione uma categoria</option>
                  {availableCategories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Valor (R$)</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Data</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F33]">Descrição</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]" placeholder="Ex: Compras do mês" />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F7F5F0] rounded-lg border border-[#0B1F33]/10">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0B1F33]">É apenas uma previsão?</span>
                  <span className="text-xs text-[#707780]">Não será computado como realizado.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.status === 'projected'} onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'projected' : 'realized' })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#0B1F33]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A9823A]"></div>
                </label>
              </div>
              {formData.type.startsWith('despesa') && (
                <div className="flex items-center gap-3 p-3 bg-[#A94B4B]/5 rounded-lg border border-[#A94B4B]/20">
                  <input type="checkbox" id="unexpected" checked={formData.is_unexpected} onChange={(e) => setFormData({ ...formData, is_unexpected: e.target.checked })} className="w-4 h-4 text-[#A94B4B] rounded" />
                  <label htmlFor="unexpected" className="text-sm font-medium text-[#A94B4B] cursor-pointer">Marcar como Imprevista / Emergência</label>
                </div>
              )}
              <button type="submit" className="w-full bg-[#0B1F33] hover:bg-[#172a3d] text-white font-semibold py-3 rounded-lg transition-colors border border-[#A9823A]/30">
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}