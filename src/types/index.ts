export type TransactionType = 'receita' | 'despesa_fixa' | 'despesa_variavel' | 'investimento' | 'reserva';
export type TransactionStatus = 'realized' | 'projected';
export type UserAuthor = 'Felipe' | 'Camila';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  created_at: string;
}

export interface CategoryBudget {
  id: string;
  category_id: string;
  monthly_limit: number;
  alert_threshold_percentage: number;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  created_by: UserAuthor;
  date: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  status: TransactionStatus;
  is_unexpected: boolean;
  description: string;
  created_at: string;
}

export interface DashboardData {
  transactions: Transaction[];
  categories: Category[];
  budgets: CategoryBudget[];
  goals: Goal[];
}