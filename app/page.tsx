'use client';
import MarketTicker from './components/MarketTicker';
import NewsCard, { NewsCardSkeleton } from './components/NewsCard';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Check, AlertTriangle, TrendingUp, Wallet, Calendar, User, X, Target, Briefcase, PiggyBank, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, BarChart3, DollarSign, Download, FileSpreadsheet, FileText, LogOut, Bell, Newspaper } from 'lucide-react';
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
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
};

// ===== DADOS MOCKADOS =====
const generateMockData = () => {
  return {
    categories: [], budgets: [], goals: [], transactions: [], goalContributions: [],
    assets: [], liabilities: [], patrimonyHistory: [], cashFlowHistory: [],
  };
};

// ===== COMPONENTES UI PREMIUM =====
function Card({ children, className = '', gold = false }: any) {
  return <div className={`card-premium ${gold ? 'card-gold' : ''} ${className}`}>{children}</div>;
}

function Badge({ children, variant = 'default' }: any) {
  const styles: any = {
    default: 'bg-slate-100 text-slate-700', realized: 'bg-green-100 text-green-800',
    projected: 'bg-slate-50 text-slate-600 border border-dashed border-slate-300',
    warning: 'bg-yellow-100 text-yellow-800', danger: 'bg-red-100 text-red-800',
    unexpected: 'bg-orange-100 text-orange-800', gold: 'bg-[#A9823A]/10 text-[#A9823A]',
    navy: 'bg-[#0B1F33]/10 text-[#0B1F33]', success: 'bg-[#2F6B57]/10 text-[#2F6B57]',
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
            <button onClick={() => setSelectedUser('Felipe')} className={`w-full p-4 rounded-lg border-2 transition-all ${selectedUser === 'Felipe' ? 'border-[#0B1F33] bg-[#0B1F33]/5' : 'border-[#0B1F33]/20 hover:border-[#0B1F33]/40'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center text-white font-bold">F</div>
                <div className="text-left"><p className="font-bold text-[#0B1F33]">Felipe</p><p className="text-xs text-[#707780]">Acessar como Felipe</p></div>
              </div>
            </button>
            <button onClick={() => setSelectedUser('Camila')} className={`w-full p-4 rounded-lg border-2 transition-all ${selectedUser === 'Camila' ? 'border-[#A9823A] bg-[#A9823A]/5' : 'border-[#0B1F33]/20 hover:border-[#0B1F33]/40'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#A9823A] rounded-full flex items-center justify-center text-white font-bold">C</div>
                <div className="text-left"><p className="font-bold text-[#0B1F33]">Camila</p><p className="text-xs text-[#707780]">Acessar como Camila</p></div>
              </div>
            </button>
          </div>
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-[#0B1F33]">Senha (opcional)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="1234 ou deixe vazio" className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-[#F7F5F0]" />
          </div>
          <button onClick={handleLogin} className="w-full bg-[#0B1F33] hover:bg-[#172a3d] text-white font-semibold py-3 rounded-lg transition-colors border border-[#A9823A]/30">Entrar</button>
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flow' | 'health' | 'goals' | 'investments' | 'patrimony' | 'news'>('dashboard');
  const [patrimonyView, setPatrimonyView] = useState<'family' | 'Felipe' | 'Camila'>('family');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'realized' | 'projected'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'Felipe' | 'Camila'>('all');
    const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 👇 COLE AQUI AS 2 LINHAS:
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [recurringTemplates, setRecurringTemplates] = useState<any[]>([]);
  // ===== ESTADOS PARA NOTÍCIAS (ADICIONE AQUI) =====
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
    const [newsSource, setNewsSource] = useState<'all' | 'infomoney' | 'investing' | 'investopedia' | 'valor' | 'moneytimes'>('all');
  const [formData, setFormData] = useState<any>({
    created_by: 'Felipe', type: 'despesa_variavel', category_id: '', amount: '',
    date: new Date().toISOString().slice(0, 10), description: '', status: 'realized', is_unexpected: false,
    goal_title: '', goal_target: '', goal_start: new Date().toISOString().slice(0, 10), goal_end: '',
    is_recurring: false, recurring_day: '', recurring_end_date: '',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  useEffect(() => {
    if (currentUser) loadData();
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
      // ADICIONE ESTA LINHA ABAIXO PARA VER NO CONSOLE DO NAVEGADOR:
      console.log('CATEGORIAS DO BANCO:', catsData, 'ERRO:', catsError);
      if (catsError) {
        setCategories([]); setBudgets([]); setGoals([]); setTransactions([]);
        setGoalContributions([]); setAssets([]); setLiabilities([]);
        setPatrimonyHistory([]); setCashFlowHistory([]); setUseMockData(true);
      } else {
       setCategories(catsData || []);;
        const { data: budgetData } = await supabase.from('category_budgets').select('*'); setBudgets(budgetData || []);
        const { data: goalsData } = await supabase.from('goals').select('*'); setGoals(goalsData || []);
        const { data: transData } = await supabase.from('transactions').select('*').order('date', { ascending: false }); setTransactions(transData || []);
        const { data: contributionsData } = await supabase.from('goal_contributions').select('*'); setGoalContributions(contributionsData || []);
        const { data: assetsData } = await supabase.from('assets').select('*'); setAssets(assetsData || []);
        const { data: liabilitiesData } = await supabase.from('liabilities').select('*'); setLiabilities(liabilitiesData || []);
        const { data: historyData } = await supabase.from('patrimony_history').select('*').order('month', { ascending: true }); setPatrimonyHistory(historyData || []);
        const { data: cashFlowData } = await supabase.from('cash_flow_history').select('*').order('month', { ascending: true }); setCashFlowHistory(cashFlowData || []);
        setUseMockData(false);
      }
    } catch (error) {
      setCategories([]); setBudgets([]); setGoals([]); setTransactions([]);
      setGoalContributions([]); setAssets([]); setLiabilities([]);
      setPatrimonyHistory([]); setCashFlowHistory([]); setUseMockData(true);
    }
    setLoading(false);
    setTimeout(() => generateRecurringForMonth(), 1000);
  };
  const monthlyTransactions = useMemo(() => transactions.filter((t) => t.date && t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);

  const filteredTransactions = useMemo(() =>
    monthlyTransactions.filter((t) => {
      if (viewFilter !== 'all' && t.status !== viewFilter) return false;
      if (userFilter !== 'all' && t.created_by !== userFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
    const goalsProgress = goalsWithProgress.length > 0 ? goalsWithProgress.reduce((sum, g) => sum + g.percentage, 0) / goalsWithProgress.length : 0;
    
    let healthStatus: 'green' | 'yellow' | 'red' = 'green';
    let healthLabel = 'Equilibrada';
    let healthScore = 0;
    const issues: string[] = [];
    const strengths: string[] = [];

    if (expenseRatio <= 60) healthScore += 25; else if (expenseRatio <= 80) healthScore += 15; else { healthScore += 5; issues.push('Despesas consomem mais de 80% da renda'); }
    if (investmentRatio >= 20) healthScore += 25; else if (investmentRatio >= 10) healthScore += 15; else { healthScore += 5; issues.push('Aportes abaixo de 10% da renda'); }
    if (hasEmergencyFund) { healthScore += 20; strengths.push('Reserva de emergência constituída'); } else { issues.push('Reserva de emergência insuficiente'); }
    if (debtRatio <= 30) { healthScore += 15; strengths.push('Nível de endividamento saudável'); } else if (debtRatio <= 50) { healthScore += 8; issues.push('Endividamento moderado'); } else { healthScore += 3; issues.push('Endividamento elevado'); }
    if (goalsProgress >= 50) { healthScore += 15; strengths.push('Progresso consistente nas metas'); } else if (goalsProgress >= 25) healthScore += 8; else { healthScore += 3; issues.push('Metas com baixo progresso'); }

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
      let alertLevel = 'normal'; let alertBadge = null;
      if (percentage >= 100) { alertLevel = 'ultrapassado'; alertBadge = 'Ultrapassado'; }
      else if (percentage >= 85) { alertLevel = 'proximo'; alertBadge = 'Limite Próximo'; }
      else if (percentage >= 70) { alertLevel = 'atencao'; alertBadge = 'Atenção'; }
      const remaining = Math.max(0, limit - spent);
      return { category, spent, limit, percentage, alertLevel, alertBadge, remaining };
    }), [budgets, categories, monthlyTransactions]
  );

  useEffect(() => {
    if (budgetStatus.length > 0) {
      const alerts = budgetStatus.filter((b) => b.alertLevel === 'ultrapassado' || b.alertLevel === 'proximo').map((b) => ({ id: b.category?.id, message: `${b.category?.name}: ${b.alertBadge} (${b.percentage.toFixed(0)}%)`, level: b.alertLevel }));
      setNotifications(alerts);
    }
  }, [budgetStatus]);

  const handleExportTransactionsExcel = () => exportToExcel(formatTransactionsForExport(filteredTransactions, categories), `transacoes_${selectedMonth}`, 'Transações');
  const handleExportTransactionsPDF = () => exportToPDF(formatTransactionsForExport(filteredTransactions, categories), `transacoes_${selectedMonth}`, 'Relatório de Transações');
  const handleExportGoalsExcel = () => exportToExcel(formatGoalsForExport(goalsWithProgress), `metas_${selectedMonth}`, 'Metas');
  const handleExportGoalsPDF = () => exportToPDF(formatGoalsForExport(goalsWithProgress), `metas_${selectedMonth}`, 'Relatório de Metas');
  const handleExportPatrimonyExcel = () => exportToExcel(formatPatrimonyForExport(assets, liabilities), `patrimonio_${selectedMonth}`, 'Patrimônio');
  const handleExportPatrimonyPDF = () => exportToPDF(formatPatrimonyForExport(assets, liabilities), `patrimonio_${selectedMonth}`, 'Relatório Patrimonial');

  const handleAddTransaction = async (e: any) => {
    e.preventDefault();
    if (!formData.category_id) { alert('Selecione uma categoria!'); return; }
    if (useMockData) {
      setTransactions((prev) => [...prev, { id: `t${Date.now()}`, ...formData, amount: parseFloat(formData.amount) }]);
    } else {
      try {
        await supabase.from('transactions').insert({ created_by: formData.created_by, date: formData.date, amount: parseFloat(formData.amount), type: formData.type, category_id: formData.category_id, status: formData.status, is_unexpected: formData.is_unexpected, description: formData.description });
        await loadData();
      } catch (error: any) { alert(`Erro: ${error?.message}`); return; }
    }
    setIsDrawerOpen(false);
    setFormData({ ...formData, amount: '', description: '', category_id: '' });
  };

  const handleAddGoal = async (e: any) => {
    e.preventDefault();
    if (!formData.goal_title || !formData.goal_target) { alert('Preencha o nome e o valor!'); return; }
    const newGoal = { title: formData.goal_title, target_amount: parseFloat(formData.goal_target), current_amount: 0, start_date: formData.goal_start, end_date: formData.goal_end || null };
    if (useMockData) {
      setGoals((prev) => [...prev, { id: `g${Date.now()}`, ...newGoal, monthly_target: 0 }]);
    } else {
      try {
        await supabase.from('goals').insert(newGoal);
        await loadData();
      } catch (error: any) { alert(`Erro: ${error.message}`); return; }
    }
    setFormData({ ...formData, goal_title: '', goal_target: '', goal_end: '' });
    setIsDrawerOpen(false);
  };

  const confirmTransaction = async (id: string) => {
    if (useMockData) { setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, status: 'realized' } : t)); return; }
    try { await supabase.from('transactions').update({ status: 'realized' }).eq('id', id); await loadData(); } catch (error) { console.error(error); }
  };
  // ===== EDITAR LANÇAMENTO =====
  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      created_by: transaction.created_by,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description || '',
      status: transaction.status,
      is_unexpected: transaction.is_unexpected || false,
      is_recurring: transaction.is_recurring || false,
      recurring_day: transaction.recurring_day || '',
      recurring_end_date: '',
      goal_title: '', goal_target: '', goal_start: new Date().toISOString().slice(0, 10), goal_end: '',
    });
    setIsDrawerOpen(true);
  };

  // ===== EXCLUIR LANÇAMENTO =====
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    if (useMockData) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    try {
      await supabase.from('transactions').delete().eq('id', id);
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir lançamento');
    }
  };

  // ===== SALVAR EDIÇÃO =====
  const handleUpdateTransaction = async (e: any) => {
    e.preventDefault();
    if (!formData.category_id) { alert('Selecione uma categoria!'); return; }
    if (useMockData) {
      setTransactions((prev) => prev.map((t) =>
        t.id === editingTransaction.id ? { ...t, ...formData, amount: parseFloat(formData.amount) } : t
      ));
      setEditingTransaction(null);
      setIsDrawerOpen(false);
      return;
    }
    try {
      await supabase.from('transactions').update({
        created_by: formData.created_by,
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category_id,
        status: formData.status,
        is_unexpected: formData.is_unexpected,
        description: formData.description,
        is_recurring: formData.is_recurring || false,
        recurring_day: formData.recurring_day || null,
      }).eq('id', editingTransaction.id);
      await loadData();
      setEditingTransaction(null);
      setIsDrawerOpen(false);
    } catch (error: any) {
      alert(`Erro ao editar: ${error?.message}`);
    }
  };

  // ===== CRIAR RECORRÊNCIA =====
  const handleCreateRecurring = async (e: any) => {
    e.preventDefault();
    if (!formData.category_id) { alert('Selecione uma categoria!'); return; }
    if (!formData.recurring_day) { alert('Informe o dia do mês!'); return; }
    const template = {
      created_by: formData.created_by,
      type: formData.type,
      category_id: formData.category_id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      day_of_month: parseInt(formData.recurring_day),
      end_date: formData.recurring_end_date || null,
      is_active: true,
    };
    if (useMockData) {
      setRecurringTemplates((prev) => [...prev, { id: `r${Date.now()}`, ...template }]);
      setIsDrawerOpen(false);
      return;
    }
    try {
      await supabase.from('recurring_templates').insert(template);
      await supabase.from('transactions').insert({
        created_by: formData.created_by,
        date: `${selectedMonth}-${String(formData.recurring_day).padStart(2, '0')}`,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category_id,
        status: 'projected',
        is_unexpected: false,
        description: formData.description,
        is_recurring: true,
        recurring_day: parseInt(formData.recurring_day),
      });
      await loadData();
      setIsDrawerOpen(false);
      alert('Recorrência criada! O lançamento será gerado automaticamente todo mês.');
    } catch (error: any) {
      alert(`Erro ao criar recorrência: ${error?.message}`);
    }
  };

  // ===== GERAR RECORRÊNCIAS DO MÊS =====
  const generateRecurringForMonth = async () => {
    if (useMockData) return;
    try {
      const { data: templates } = await supabase.from('recurring_templates').select('*').eq('is_active', true);
      if (!templates || templates.length === 0) return;
      const year = selectedMonth.split('-')[0];
      const month = selectedMonth.split('-')[1];
      for (const template of templates) {
        const dayStr = String(template.day_of_month).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        const { data: existing } = await supabase.from('transactions').select('id').eq('date', dateStr).eq('category_id', template.category_id).eq('is_recurring', true).limit(1);
        if (!existing || existing.length === 0) {
          await supabase.from('transactions').insert({
            created_by: template.created_by,
            date: dateStr,
            amount: template.amount,
            type: template.type,
            category_id: template.category_id,
            status: 'projected',
            is_unexpected: false,
            description: template.description,
            is_recurring: true,
            recurring_day: template.day_of_month,
          });
        }
      }
      await loadData();
    } catch (error) {
      console.error('Erro ao gerar recorrências:', error);
    }
  };
  
  

  // ===== FUNÇÃO PARA BUSCAR NOTÍCIAS (ADICIONE AQUI) =====
  const fetchNews = async (source: string = 'all') => {
    try {
      setNewsLoading(true);
      const response = await fetch(`/api/news?source=${source}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews(newsSource);
    }
  }, [activeTab, newsSource]);

  const availableCategories = categories.filter((c) => c.type === formData.type);

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A9823A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-24 font-body">
      
      {/* Notificações Flutuantes */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-xs">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-3 rounded-lg shadow-lg border ${notif.level === 'ultrapassado' ? 'bg-[#A94B4B] text-white border-[#A94B4B]' : 'bg-[#B8860B] text-white border-[#B8860B]'}`}>
              <div className="flex items-center gap-2"><Bell className="w-4 h-4 flex-shrink-0" /><span className="text-sm font-medium">{notif.message}</span></div>
            </div>
          ))}
        </div>
      )}

      <header className="sticky top-0 z-50 bg-[#F7F5F0] border-b border-[#0B1F33]/10 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-[#C5A45A]" /></div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#0B1F33]">Finanças do Casal</h1>
                <p className="text-xs text-[#707780]">Olá, {currentUser}! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#0B1F33]/10">
                <Calendar className="w-4 h-4 text-[#707780]" />
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-sm bg-transparent outline-none text-[#0B1F33] font-medium" />
              </div>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 bg-white rounded-lg border border-[#0B1F33]/10 hover:bg-[#0B1F33]/5 transition-colors"><Download className="w-4 h-4 text-[#0B1F33]" /></button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl border border-[#0B1F33]/10 p-2 z-50">
                      <p className="text-[10px] font-bold text-[#707780] uppercase px-2 py-1">Transações</p>
                      <button onClick={() => { handleExportTransactionsExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Excel</button>
                      <button onClick={() => { handleExportTransactionsPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileText className="w-4 h-4 text-[#A94B4B]" /> PDF</button>
                      <p className="text-[10px] font-bold text-[#707780] uppercase px-2 py-1 mt-1">Metas</p>
                      <button onClick={() => { handleExportGoalsExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Excel</button>
                      <button onClick={() => { handleExportGoalsPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileText className="w-4 h-4 text-[#A94B4B]" /> PDF</button>
                      <p className="text-[10px] font-bold text-[#707780] uppercase px-2 py-1 mt-1">Patrimônio</p>
                      <button onClick={() => { handleExportPatrimonyExcel(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileSpreadsheet className="w-4 h-4 text-[#2F6B57]" /> Excel</button>
                      <button onClick={() => { handleExportPatrimonyPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F5F0] rounded"><FileText className="w-4 h-4 text-[#A94B4B]" /> PDF</button>
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleLogout} className="p-2 bg-white rounded-lg border border-[#0B1F33]/10 hover:bg-[#A94B4B]/10 transition-colors"><LogOut className="w-4 h-4 text-[#A94B4B]" /></button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Início', icon: Wallet }, 
              { id: 'flow', label: 'Fluxo', icon: BarChart3 }, 
              { id: 'health', label: 'Saúde', icon: Activity }, 
              { id: 'goals', label: 'Metas', icon: Target }, 
              { id: 'investments', label: 'Investimentos', icon: Briefcase }, 
              { id: 'patrimony', label: 'Patrimônio', icon: PiggyBank },
              { id: 'news', label: 'Notícias', icon: Newspaper }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#0B1F33] text-white shadow-md' : 'bg-white text-[#707780] hover:bg-[#0B1F33]/5 border border-[#0B1F33]/5'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
  <MarketTicker />
      <main className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5"><p className="text-xs text-[#707780] font-medium uppercase">Receitas</p><p className="text-2xl font-bold text-[#2F6B57] mt-2 font-display">{formatBRL(metrics.realizedIncome)}</p></Card>
              <Card className="p-5"><p className="text-xs text-[#707780] font-medium uppercase">Despesas</p><p className="text-2xl font-bold text-[#A94B4B] mt-2 font-display">{formatBRL(metrics.realizedExpenses)}</p>{metrics.unexpectedExpenses > 0 && <p className="text-xs text-[#B8860B] mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {formatBRL(metrics.unexpectedExpenses)} imprevistos</p>}</Card>
              <Card className="p-5"><p className="text-xs text-[#707780] font-medium uppercase">Saldo</p><p className={`text-2xl font-bold mt-2 font-display ${metrics.saldo >= 0 ? 'text-[#0B1F33]' : 'text-[#A94B4B]'}`}>{formatBRL(metrics.saldo)}</p></Card>
              <Card className="p-5"><p className="text-xs text-[#707780] font-medium uppercase">Saldo Disponível</p><p className={`text-2xl font-bold mt-2 font-display ${metrics.saldoDisponivel >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{formatBRL(metrics.saldoDisponivel)}</p></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-[#A9823A]" /><h3 className="font-display font-bold text-[#0B1F33]">Aportes do Mês</h3></div>
                <p className="text-3xl font-bold text-[#0B1F33] font-display">{formatBRL(metrics.totalAportes)}</p>
                <div className="flex gap-3 mt-4 text-xs text-[#707780]"><span>Ações: {formatBRL(metrics.investmentTotals.acoes)}</span><span>•</span><span>FIIs: {formatBRL(metrics.investmentTotals.fiis)}</span><span>•</span><span>USD: {formatUSD(metrics.investmentTotals.dolar)}</span></div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3"><Briefcase className="w-5 h-5 text-[#A9823A]" /><h3 className="font-display font-bold text-[#0B1F33]">Total Investido</h3></div>
                <p className="text-3xl font-bold text-[#0B1F33] font-display">{formatBRL(metrics.investmentTotals.acoes + metrics.investmentTotals.fiis + (metrics.investmentTotals.dolar * 5.5))}</p>
                <p className="text-xs text-[#707780] mt-2">{metrics.investments.length} aportes no mês</p>
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-[#0B1F33]" /><h3 className="font-display font-bold text-[#0B1F33]">Tetos de Gastos</h3></div>
              {budgetStatus.length === 0 ? <p className="text-sm text-[#707780] py-4 text-center">Nenhum teto configurado.</p> : (
                <div className="space-y-4">
                  {budgetStatus.map((budget, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#0B1F33] text-white shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-white text-lg">{budget.category?.name}</span>
                        <div className="flex items-center gap-3">
                          {budget.alertBadge && <span className={`badge-premium ${budget.alertLevel === 'ultrapassado' ? 'bg-[#A94B4B] text-white' : budget.alertLevel === 'proximo' ? 'bg-[#B8860B] text-white' : 'bg-[#C5A45A] text-white'}`}>{budget.alertBadge}</span>}
                          <span className="text-sm text-white/80 font-medium">{formatBRL(budget.spent)} / {formatBRL(budget.limit)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(budget.percentage, 100)}%` }} /></div>
                      <div className="flex justify-between mt-2 text-xs text-white/70">
                        <span>{budget.percentage.toFixed(0)}% utilizado</span>
                        <span>{budget.alertLevel !== 'ultrapassado' ? `Restam ${formatBRL(budget.remaining)}` : `Ultrapassou ${formatBRL(budget.spent - budget.limit)}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-[#0B1F33]">Lançamentos</h3>
                <div className="flex gap-2">
                  {(['all', 'Felipe', 'Camila'] as const).map((user) => (
                    <button key={user} onClick={() => setUserFilter(user)} className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === user ? 'bg-[#0B1F33] text-white' : 'bg-[#F7F5F0] text-[#707780]'}`}>{user === 'all' ? 'Todos' : user}</button>
                  ))}
                </div>
              </div>
              {filteredTransactions.length === 0 ? <p className="text-center text-[#707780] py-8 text-sm">Nenhum lançamento neste mês.</p> : (
                <div className="space-y-3">
                                   {filteredTransactions.map((t) => {
                    const cat = categories.find(c => c.id === t.category_id);
                    return (
                      <div key={t.id} className="flex justify-between items-center p-4 bg-[#F7F5F0] rounded-lg group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${t.created_by === 'Felipe' ? 'bg-[#0B1F33] text-white' : 'bg-[#A9823A] text-white'}`}>{t.created_by[0]}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-[#0B1F33] truncate">{t.description || cat?.name}</p>
                              {t.is_recurring && <span className="text-xs bg-[#A9823A]/10 text-[#A9823A] px-1.5 py-0.5 rounded flex-shrink-0">🔄</span>}
                            </div>
                            <p className="text-xs text-[#707780]">{formatDateBR(t.date)} • {cat?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <p className={`font-bold font-display text-sm ${t.type === 'receita' ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>
                            {t.type === 'receita' ? '+' : '-'} {formatCurrency(Number(t.amount), cat?.name)}
                          </p>
                          {t.status === 'projected' && (
                            <button onClick={() => confirmTransaction(t.id)} className="text-xs bg-white border border-[#0B1F33]/20 px-2 py-1 rounded text-[#0B1F33] hover:bg-[#0B1F33]/5">Efetivar</button>
                          )}
                          <button onClick={() => handleEditTransaction(t)} className="p-1.5 hover:bg-[#0B1F33]/10 rounded-lg transition-colors " title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#0B1F33]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 hover:bg-[#A94B4B]/10 rounded-lg transition-colors" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#A94B4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {/* FLUXO */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#0B1F33] flex items-center gap-2"><BarChart3 className="text-[#A9823A]"/> Fluxo Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#2F6B57]" /><p className="text-xs text-[#707780] font-medium uppercase">Receitas</p></div>{flowMetrics.incomeChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowDownRight className="w-4 h-4 text-[#A94B4B]" />}</div><p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.income)}</p><p className={`text-xs mt-1 ${flowMetrics.incomeChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.incomeChange >= 0 ? '+' : ''}{flowMetrics.incomeChange.toFixed(1)}% vs mês anterior</p></Card>
              <Card className="p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-[#A94B4B]" /><p className="text-xs text-[#707780] font-medium uppercase">Despesas</p></div>{flowMetrics.expensesChange <= 0 ? <ArrowDownRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowUpRight className="w-4 h-4 text-[#A94B4B]" />}</div><p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.expenses)}</p><p className={`text-xs mt-1 ${flowMetrics.expensesChange <= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.expensesChange >= 0 ? '+' : ''}{flowMetrics.expensesChange.toFixed(1)}% vs mês anterior</p></Card>
              <Card className="p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#A9823A]" /><p className="text-xs text-[#707780] font-medium uppercase">Aportes</p></div>{flowMetrics.contributionsChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-[#2F6B57]" /> : <ArrowDownRight className="w-4 h-4 text-[#A94B4B]" />}</div><p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(flowMetrics.contributions)}</p><p className={`text-xs mt-1 ${flowMetrics.contributionsChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.contributionsChange >= 0 ? '+' : ''}{flowMetrics.contributionsChange.toFixed(1)}% vs mês anterior</p></Card>
              <Card className="p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><PiggyBank className="w-5 h-5 text-[#0B1F33]" /><p className="text-xs text-[#707780] font-medium uppercase">Saldo</p></div></div><p className={`text-2xl font-bold font-display ${flowMetrics.balance >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{formatBRL(flowMetrics.balance)}</p><p className="text-xs text-[#707780] mt-1">Receitas - Despesas - Aportes</p></Card>
            </div>
            <Card className="p-6">
              <h3 className="font-display font-bold text-[#0B1F33] mb-6">Evolução Mensal (Últimos 6 meses)</h3>
              {flowMetrics.history.length === 0 ? <p className="text-center py-10 text-[#707780]">Sem histórico ainda.</p> : (
                <div className="space-y-6">
                  {flowMetrics.history.map((item: any, idx: number) => {
                    const balance = item.income - item.expenses - item.contributions;
                    const maxIncome = Math.max(...flowMetrics.history.map((h: any) => h.income));
                    const maxExpenses = Math.max(...flowMetrics.history.map((h: any) => h.expenses));
                    return (
                      <div key={idx} className="space-y-3 p-4 bg-[#F7F5F0] rounded-lg">
                        <div className="flex items-center justify-between mb-2"><span className="font-medium text-[#0B1F33] font-display">{formatMonthYear(item.month)}</span><span className={`font-bold font-display ${balance >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{formatBRL(balance)}</span></div>
                        <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-[#707780]">Receitas</span><span className="font-medium text-[#2F6B57]">{formatBRL(item.income)}</span></div><ProgressBar value={(item.income / maxIncome) * 100} color="bg-[#2F6B57]" /></div>
                        <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-[#707780]">Despesas</span><span className="font-medium text-[#A94B4B]">{formatBRL(item.expenses)}</span></div><ProgressBar value={(item.expenses / maxExpenses) * 100} color="bg-[#A94B4B]" /></div>
                        <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-[#707780]">Aportes</span><span className="font-medium text-[#A9823A]">{formatBRL(item.contributions)}</span></div><ProgressBar value={(item.contributions / maxIncome) * 100} color="bg-[#A9823A]" /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card className="p-6">
              <h3 className="font-display font-bold text-[#0B1F33] mb-4">Análise de Tendência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#2F6B57]/5 rounded-lg border border-[#2F6B57]/20"><p className="text-sm text-[#707780] mb-1">Receitas</p><p className={`text-lg font-bold font-display ${flowMetrics.incomeChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.incomeChange >= 0 ? '↗' : '↘'} {flowMetrics.incomeChange >= 0 ? 'Crescendo' : 'Diminuindo'}</p><p className="text-xs text-[#707780] mt-1">{flowMetrics.incomeChange >= 0 ? 'Receitas em alta!' : 'Atenção: receitas em queda'}</p></div>
                <div className="p-4 bg-[#A94B4B]/5 rounded-lg border border-[#A94B4B]/20"><p className="text-sm text-[#707780] mb-1">Despesas</p><p className={`text-lg font-bold font-display ${flowMetrics.expensesChange <= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.expensesChange <= 0 ? '↘' : '↗'} {flowMetrics.expensesChange <= 0 ? 'Controladas' : 'Aumentando'}</p><p className="text-xs text-[#707780] mt-1">{flowMetrics.expensesChange <= 0 ? 'Ótimo controle!' : 'Revisar gastos'}</p></div>
                <div className="p-4 bg-[#A9823A]/5 rounded-lg border border-[#A9823A]/20"><p className="text-sm text-[#707780] mb-1">Aportes</p><p className={`text-lg font-bold font-display ${flowMetrics.contributionsChange >= 0 ? 'text-[#2F6B57]' : 'text-[#A94B4B]'}`}>{flowMetrics.contributionsChange >= 0 ? '↗' : '↘'} {flowMetrics.contributionsChange >= 0 ? 'Aumentando' : 'Diminuindo'}</p><p className="text-xs text-[#707780] mt-1">{flowMetrics.contributionsChange >= 0 ? 'Investimentos crescendo!' : 'Aumentar aportes'}</p></div>
              </div>
            </Card>
          </div>
        )}

        {/* SAÚDE */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#0B1F33] flex items-center gap-2"><Activity className="text-[#A9823A]"/> Saúde Financeira</h2>
            <Card className={`p-6 text-center ${healthMetrics.healthStatus === 'green' ? 'bg-[#2F6B57]/5 border-[#2F6B57]/20' : healthMetrics.healthStatus === 'yellow' ? 'bg-[#B8860B]/5 border-[#B8860B]/20' : 'bg-[#A94B4B]/5 border-[#A94B4B]/20'}`}>
              <p className="text-4xl mb-2">{healthMetrics.healthStatus === 'green' ? '🟢' : healthMetrics.healthStatus === 'yellow' ? '🟡' : '🔴'}</p>
              <h3 className="text-2xl font-bold font-display text-[#0B1F33]">{healthMetrics.healthLabel}</h3>
              <p className="text-[#707780] mt-1">Score: {healthMetrics.healthScore}/100</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5"><h4 className="font-bold text-[#2F6B57] mb-2 flex items-center gap-1"><ArrowUpRight className="w-4 h-4"/> Pontos Fortes</h4><ul className="text-sm text-[#707780] space-y-1 list-disc pl-4">{healthMetrics.strengths.length ? healthMetrics.strengths.map((s,i)=><li key={i}>{s}</li>) : <li>Nenhum identificado</li>}</ul></Card>
              <Card className="p-5"><h4 className="font-bold text-[#A94B4B] mb-2 flex items-center gap-1"><ArrowDownRight className="w-4 h-4"/> Atenção</h4><ul className="text-sm text-[#707780] space-y-1 list-disc pl-4">{healthMetrics.issues.length ? healthMetrics.issues.map((s,i)=><li key={i}>{s}</li>) : <li>Tudo sob controle</li>}</ul></Card>
            </div>
            <Card className="p-5">
              <h3 className="font-display font-bold text-[#0B1F33] mb-4">Métricas Detalhadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F7F5F0] rounded-lg"><p className="text-xs text-[#707780] mb-1">Despesas/Receita</p><p className={`text-2xl font-bold font-display ${healthMetrics.expenseRatio <= 60 ? 'text-[#2F6B57]' : healthMetrics.expenseRatio <= 80 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.expenseRatio.toFixed(1)}%</p><p className="text-xs text-[#707780] mt-1">Ideal: até 60%</p></div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg"><p className="text-xs text-[#707780] mb-1">Aportes/Receita</p><p className={`text-2xl font-bold font-display ${healthMetrics.investmentRatio >= 20 ? 'text-[#2F6B57]' : healthMetrics.investmentRatio >= 10 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.investmentRatio.toFixed(1)}%</p><p className="text-xs text-[#707780] mt-1">Ideal: 20%+</p></div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg"><p className="text-xs text-[#707780] mb-1">Dívidas/Ativos</p><p className={`text-2xl font-bold font-display ${healthMetrics.debtRatio <= 30 ? 'text-[#2F6B57]' : healthMetrics.debtRatio <= 50 ? 'text-[#B8860B]' : 'text-[#A94B4B]'}`}>{healthMetrics.debtRatio.toFixed(1)}%</p><p className="text-xs text-[#707780] mt-1">Ideal: até 30%</p></div>
              </div>
            </Card>
          </div>
        )}

        {/* METAS (CORRIGIDO) */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6"><Target className="w-6 h-6 text-[#A9823A]" /><h2 className="font-display text-2xl font-bold text-[#0B1F33]">Nossos Sonhos & Objetivos</h2></div>
            
            {goalsWithProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-xl border border-dashed border-[#0B1F33]/20">
                <Target className="w-16 h-16 text-[#0B1F33]/10 mb-4" />
                <p className="text-[#707780] mb-6 text-lg">Nenhum sonho cadastrado ainda.</p>
                <button onClick={() => setIsDrawerOpen(true)} className="bg-[#A9823A] hover:bg-[#8c6b2e] text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-[#A9823A]/20 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Cadastrar nossa primeira meta
                </button>
              </div>
            ) : (
              goalsWithProgress.map((goal) => {
                const startDate = new Date(goal.start_date || new Date());
                const endDate = goal.end_date ? new Date(goal.end_date) : null;
                const today = new Date();
                let durationText = "Sem prazo definido"; let daysLeft = 0; let progressTime = 0;
                if (endDate) {
                  const totalDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1; 
                  daysLeft = Math.ceil(Math.abs(endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const daysPassed = Math.ceil(Math.abs(today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  progressTime = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
                  durationText = today > endDate ? "Prazo encerrado" : `${daysLeft} dias restantes`;
                }
                return (
                  <Card key={goal.id} className="p-6 relative overflow-hidden">
                    {endDate && <div className="absolute top-0 left-0 w-full h-1.5 bg-[#F7F5F0]"><div className="h-full bg-[#A9823A]" style={{ width: `${progressTime}%` }}></div></div>}
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#0B1F33]">{goal.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#707780]">
                          <span>Início: {formatDateBR(goal.start_date || new Date().toISOString().slice(0,10))}</span>
                          {endDate && (<><span>•</span><span>Fim: {formatDateBR(goal.end_date)}</span></>)}
                        </div>
                      </div>
                      <div className="text-right"><p className="text-2xl font-bold text-[#0B1F33] font-display">{formatBRL(goal.totalAcumulado)}</p><Badge variant="gold">{goal.percentage.toFixed(1)}%</Badge></div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#707780] mb-1"><span>Progresso Financeiro</span><span>Meta: {formatBRL(goal.target_amount)}</span></div>
                      <ProgressBar value={goal.percentage} color="bg-[#0B1F33]" />
                    </div>
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#0B1F33]/10">
                      <div className="text-sm text-[#707780]">
                        {endDate && <p className={`font-medium flex items-center gap-1 ${daysLeft < 30 && daysLeft > 0 ? 'text-[#A94B4B]' : 'text-[#2F6B57]'}`}>⏳ {durationText}</p>}
                        <p className="mt-1">Faltam <span className="font-semibold text-[#0B1F33]">{formatBRL(goal.remaining)}</span></p>
                      </div>
                      <div className="flex gap-2">
                         <div className="bg-[#0B1F33]/5 px-3 py-1.5 rounded text-xs text-center"><p className="text-[#707780]">Aportes</p><p className="font-bold text-[#0B1F33]">{formatBRL(goal.totalAportes)}</p></div>
                         <div className="bg-[#A9823A]/5 px-3 py-1.5 rounded text-xs text-center"><p className="text-[#707780]">Rendimentos</p><p className="font-bold text-[#A9823A]">{formatBRL(goal.totalRendimentos)}</p></div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* INVESTIMENTOS */}
        {activeTab === 'investments' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0B1F33] flex items-center gap-2"><Briefcase className="text-[#A9823A]"/> Investimentos</h2>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0B1F33]/5 p-5 rounded-lg"><p className="text-sm text-[#707780]">Total Aportado</p><p className="text-3xl font-bold text-[#0B1F33] mt-2 font-display">{formatBRL(metrics.totalAportes)}</p></div>
                <div className="bg-[#A9823A]/5 p-5 rounded-lg"><p className="text-sm text-[#707780]">Rendimentos</p><p className="text-3xl font-bold text-[#A9823A] mt-2 font-display">{formatBRL(metrics.totalAportes * 0.0644)}</p><p className="text-xs text-[#A9823A] mt-2 font-medium">+6,44% de rentabilidade</p></div>
              </div>
              <h3 className="font-display font-bold text-[#0B1F33] mb-3">Distribuição</h3>
              <div className="space-y-2">
                {[{ name: 'Ações', value: metrics.investmentTotals.acoes, color: 'bg-[#0B1F33]' }, { name: 'FIIs', value: metrics.investmentTotals.fiis, color: 'bg-[#A9823A]' }, { name: 'Dólar', value: metrics.investmentTotals.dolar, color: 'bg-[#2F6B57]', isUSD: true }].map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-[#F7F5F0] rounded-lg">
                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.color}`}></div><span className="text-sm font-medium text-[#0B1F33]">{item.name}</span></div>
                    <span className="font-bold text-[#0B1F33] font-display">{item.isUSD ? formatUSD(item.value) : formatBRL(item.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* PATRIMÔNIO */}
        {activeTab === 'patrimony' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-[#0B1F33] flex items-center gap-2"><PiggyBank className="text-[#A9823A]"/> Patrimônio Líquido</h2>
              <div className="flex bg-white p-1 rounded-lg border border-[#0B1F33]/10">
                {(['family', 'Felipe', 'Camila'] as const).map(v => (<button key={v} onClick={()=>setPatrimonyView(v)} className={`px-3 py-1 text-xs rounded-md ${patrimonyView===v ? 'bg-[#0B1F33] text-white' : 'text-[#707780]'}`}>{v==='family'?'Família':v}</button>))}
              </div>
            </div>
            <Card className="p-6 card-gold text-center">
              <p className="text-[#C5A45A] text-sm uppercase tracking-wider">Patrimônio Líquido</p>
              <p className="text-4xl font-bold font-display mt-2">{formatBRL(patrimonyMetrics.netPatrimony)}</p>
              <div className="flex justify-center gap-8 mt-6 text-sm">
                 <div><p className="text-white/60">Ativos</p><p className="font-bold">{formatBRL(patrimonyMetrics.totalAssets)}</p></div>
                 <div><p className="text-white/60">Passivos</p><p className="font-bold">{formatBRL(patrimonyMetrics.totalLiabilities)}</p></div>
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
                      <div className="flex justify-between text-sm"><span className="font-medium text-[#0B1F33]">{formatMonthYear(item.month)}</span><span className="font-bold text-[#0B1F33] font-display">{formatBRL(item.net_patrimony)}</span></div>
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
                      <div><p className="text-sm font-medium text-[#0B1F33]">{asset.name}</p><p className="text-xs text-[#707780]">{asset.owner}</p></div>
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
                      <div><p className="text-sm font-medium text-[#0B1F33]">{liability.name}</p><p className="text-xs text-[#707780]">{liability.owner}</p></div>
                      <span className="font-bold text-[#A94B4B] font-display">{formatBRL(liability.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
                {/* ===== ABA NOTÍCIAS ===== */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Newspaper className="w-6 h-6 text-[#A9823A]" />
              <h2 className="font-display text-2xl font-bold text-[#0B1F33]">Notícias do Mercado</h2>
            </div>

            {/* Filtros por Fonte */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {[
              { id: 'all', label: 'Todas' },
              { id: 'infomoney', label: 'InfoMoney' },
              { id: 'investing', label: 'Investing.com' },
              { id: 'investopedia', label: 'Investopedia' },
              { id: 'valor', label: 'Valor Econômico' },
              { id: 'moneytimes', label: 'Money Times' },
            ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setNewsSource(filter.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    newsSource === filter.id
                      ? 'bg-[#0B1F33] text-white shadow-md'
                      : 'bg-white text-[#707780] hover:bg-[#0B1F33]/5 border border-[#0B1F33]/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Grid de Notícias */}
            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#0B1F33]/20">
                <Newspaper className="w-16 h-16 text-[#0B1F33]/10 mx-auto mb-4" />
                <p className="text-[#707780] text-lg">Nenhuma notícia encontrada</p>
                <button 
                  onClick={() => fetchNews(newsSource)}
                  className="mt-4 text-[#A9823A] font-medium hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-[#0B1F33] hover:bg-[#172a3d] text-[#C5A45A] rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 border border-[#A9823A]/30">
        <Plus className="w-8 h-8" />
      </button>

      {/* DRAWER CONDICIONAL CORRIGIDO */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1F33]/50 backdrop-blur-sm flex justify-end" onClick={() => setIsDrawerOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-[#0B1F33]/10 p-4 z-10">
              <h2 className="font-display text-lg font-bold text-[#0B1F33]">
  {activeTab === 'goals' ? 'Nova Meta / Sonho' : editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-[#F7F5F0] rounded"><X className="w-5 h-5 text-[#707780]" /></button>
            </div>
            
            <div className="p-6">
              {activeTab === 'goals' ? (
                <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Nome do Sonho / Meta</label>
                    <input type="text" required value={formData.goal_title} onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#A9823A]" placeholder="Ex: Nossa Casa, Viagem Europa" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Valor Objetivo (R$)</label>
                    <input type="number" step="0.01" required value={formData.goal_target} onChange={(e) => setFormData({ ...formData, goal_target: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#A9823A]" placeholder="Ex: 500000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0B1F33]">Data de Início</label>
                      <input type="date" required value={formData.goal_start} onChange={(e) => setFormData({ ...formData, goal_start: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#A9823A]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0B1F33]">Previsão de Término</label>
                      <input type="date" value={formData.goal_end} onChange={(e) => setFormData({ ...formData, goal_end: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#A9823A]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#A9823A] hover:bg-[#8c6b2e] text-white font-semibold py-4 rounded-lg transition-colors mt-6 shadow-lg shadow-[#A9823A]/20">Criar Meta</button>
                </form>
              ) : (
                <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Quem Lançou</label>
                    <select value={formData.created_by} onChange={(e) => setFormData({ ...formData, created_by: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]">
                      <option value="Felipe">Felipe</option><option value="Camila">Camila</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Tipo</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]">
                      <option value="receita">Receita</option><option value="despesa_fixa">Despesa Fixa</option>
                      <option value="despesa_variavel">Despesa Variável</option><option value="investimento">Investimento</option><option value="reserva">Reserva</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Categoria</label>
                    <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]">
                      <option value="">Selecione...</option>
                      {availableCategories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Valor (R$)</label>
                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Data</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0B1F33]">Descrição</label>
                    <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-[#0B1F33]/20 px-4 py-3 text-sm bg-[#F7F5F0]" placeholder="Ex: Compras do mês" />
                  </div>
                                   {/*                   {/* Campos de Recorrência */}
                  <div className="space-y-3 p-4 bg-[#A9823A]/5 rounded-lg border border-[#A9823A]/20">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_recurring || false}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="w-4 h-4 rounded border-[#0B1F33]/20 text-[#A9823A] focus:ring-[#A9823A]"
                      />
                      <span className="text-sm font-medium text-[#0B1F33]">🔄 Lançamento recorrente</span>
                    </label>
                    {formData.is_recurring && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="text-xs text-[#707780] block mb-1">Dia do mês</label>
                          <input 
                            type="number" min="1" max="31" 
                            value={formData.recurring_day || ''} 
                            onChange={(e) => setFormData({ ...formData, recurring_day: e.target.value })} 
                            className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-white" 
                            placeholder="Ex: 10" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#707780] block mb-1">Até quando?</label>
                          <input 
                            type="date" 
                            value={formData.recurring_end_date || ''} 
                            onChange={(e) => setFormData({ ...formData, recurring_end_date: e.target.value })} 
                            className="w-full rounded-lg border border-[#0B1F33]/20 px-3 py-2 text-sm bg-white" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {editingTransaction ? (
                    <div className="flex gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => { setEditingTransaction(null); setIsDrawerOpen(false); }} 
                        className="flex-1 bg-[#F7F5F0] text-[#0B1F33] font-semibold py-4 rounded-lg transition-colors border border-[#0B1F33]/10"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-[#0B1F33] hover:bg-[#172a3d] text-white font-semibold py-4 rounded-lg transition-colors shadow-lg"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  ) : formData.is_recurring ? (
                    <button 
                      type="button" 
                      onClick={handleCreateRecurring} 
                      className="w-full bg-[#A9823A] hover:bg-[#8c6b2e] text-white font-semibold py-4 rounded-lg transition-colors mt-6 shadow-lg"
                    >
                      🔄 Criar Recorrência
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="w-full bg-[#0B1F33] hover:bg-[#172a3d] text-white font-semibold py-4 rounded-lg transition-colors mt-6 shadow-lg"
                    >
                      Salvar Lançamento
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}