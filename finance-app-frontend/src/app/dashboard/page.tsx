// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "@/services/api";
import type { Account, Transaction, Category, Budget } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccountModal from "@/components/AccountModal";
import TransactionModal from "@/components/TransactionModal";
import CategoryModal from "@/components/CategoryModal";
import BudgetModal from "@/components/BudgetModal";
import Link from "next/link";

function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string;
  icon: string;
  color?: "blue" | "green" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-400",
    green: "from-green-500 to-emerald-400",
    red: "from-red-500 to-pink-400",
    purple: "from-purple-500 to-indigo-400",
  }[color];

  return (
    <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-700 text-sm font-semibold tracking-wide uppercase">{title}</span>
        <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${colorClasses} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</p>
    </div>
  );
}

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="glass rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl group border border-white/20">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            💳
          </div>
          <h3 className="font-bold text-gray-800 text-lg">{account.name}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
            title="Edit account"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            title="Delete account"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
        ${account.balance.toFixed(2)}
      </p>
    </div>
  );
}

function TransactionRow({
  transaction,
  categories,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}) {
  const category = categories.find((c) => c.id === transaction.category_id);
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between py-4 px-3 rounded-xl hover:bg-white/40 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md transform group-hover:scale-110 transition-transform duration-200 ${
            isIncome
              ? "bg-gradient-to-br from-green-400 to-emerald-500"
              : "bg-gradient-to-br from-red-400 to-pink-500"
          }`}
        >
          {isIncome ? "↑" : "↓"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-base">
            {transaction.description || "No description"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200/60 text-gray-700 font-medium">
              {category?.name || "Uncategorized"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p
          className={`font-bold text-xl ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
            title="Edit transaction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            title="Delete transaction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError("");

      const [accountsData, transactionsData, categoriesData, budgetsData] =
        await Promise.all([
          api.getAccounts(user.id, token),
          api.getTransactions(user.id, token, {
            limit: 10,
            sort_by: "date",
            order: "desc",
          }),
          api.getCategories(token),
          api.getBudgets(user.id, token),
        ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      if (errorMessage === "UNAUTHORIZED") {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  // Account handlers
  const handleSaveAccount = async (data: { name: string; balance: number }) => {
    if (!user || !token) return;
    setModalLoading(true);

    try {
      if (editingAccount) {
        await api.updateAccount(user.id, editingAccount.id, data, token);
      } else {
        await api.createAccount(user.id, data.name, data.balance, token);
      }
      await loadDashboardData();
      setEditingAccount(null);
    } catch {
      throw new Error("Failed to save account");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!user || !token || !confirm("Delete this account?")) return;

    try {
      await api.deleteAccount(user.id, id, token);
      await loadDashboardData();
    } catch {
      alert("Failed to delete account");
    }
  };

  // Transaction handlers
  const handleSaveTransaction = async (data: {
    amount: number;
    type: "income" | "expense";
    description?: string;
    date?: string;
    account_id: number;
    category_id?: number | null;
  }) => {
    if (!user || !token) return;
    setModalLoading(true);

    try {
      if (editingTransaction) {
        await api.updateTransaction(
          user.id,
          editingTransaction.id,
          data,
          token
        );
      } else {
        await api.createTransaction(user.id, data, token);
      }
      await loadDashboardData();
      setEditingTransaction(null);
    } catch {
      throw new Error("Failed to save transaction");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!user || !token || !confirm("Delete this transaction?")) return;

    try {
      await api.deleteTransaction(user.id, id, token);
      await loadDashboardData();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  // Category handlers
  const handleSaveCategory = async (name: string, type: 'income' | 'expense' | 'both') => {
    if (!token) return;
    setModalLoading(true);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name, type }, token);
      } else {
        await api.createCategory(name, type, token);
      }
      await loadDashboardData();
      setEditingCategory(null);
    } catch {
      throw new Error("Failed to save category");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!token || !confirm("Delete this category?")) return;

    try {
      await api.deleteCategory(id, token);
      await loadDashboardData();
    } catch {
      alert("Failed to delete category");
    }
  };

  // Budget handlers
  const handleSaveBudget = async (
    amount: number,
    categoryId: number,
    period?: string
  ) => {
    if (!user || !token) return;
    setModalLoading(true);

    try {
      if (editingBudget) {
        await api.updateBudget(
          user.id,
          editingBudget.id,
          { amount, period },
          token
        );
      } else {
        await api.createBudget(
          user.id,
          { amount, category_id: categoryId, period },
          token
        );
      }
      await loadDashboardData();
      setEditingBudget(null);
    } catch {
      throw new Error("Failed to save budget");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!user || !token || !confirm("Delete this budget?")) return;

    try {
      await api.deleteBudget(user.id, id, token);
      await loadDashboardData();
    } catch {
      alert("Failed to delete budget");
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="animate-slide-in">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Finance Tracker
              </h1>
              <p className="text-sm text-gray-700 font-medium mt-1">
                Welcome back, <span className="font-bold">{user?.username}</span>! 👋
              </p>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="glass border-2 border-red-300 bg-red-50/90 text-red-800 px-6 py-4 rounded-2xl mb-6 animate-scale-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Error: {error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={`$${totalBalance.toFixed(2)}`}
            icon="💰"
            color="blue"
          />
          <StatCard
            title="Total Accounts"
            value={accounts.length.toString()}
            icon="🏦"
            color="purple"
          />
          <StatCard
            title="Income"
            value={`$${totalIncome.toFixed(2)}`}
            icon="📈"
            color="green"
          />
          <StatCard
            title="Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon="📉"
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Accounts</h2>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setAccountModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm"
              >
                + Add Account
              </button>
            </div>
            {accounts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-600 font-medium">No accounts yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first account to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => {
                      setEditingAccount(acc);
                      setAccountModalOpen(true);
                    }}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                   
            <div className="flex justify-between items-center mb-4">
                       
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Recent Transactions
              </h2>
                   
              <div className="flex items-center gap-4">
                       
                <Link
                  href="/transactions"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm"
                >
                  View All
                </Link>
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setTransactionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm"
                  disabled={accounts.length === 0}
                >
                  + Add Transaction
                </button>
              </div>
            </div>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No transactions yet.
              </p>
            ) : (
              <div>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    categories={categories}
                    onEdit={(txn) => {
                      setEditingTransaction(txn);
                      setTransactionModalOpen(true);
                    }}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm"
            >
              + Add Category
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const typeGradient = category.type === 'income'
                ? 'from-green-400 to-emerald-500'
                : category.type === 'expense'
                ? 'from-red-400 to-pink-500'
                : 'from-blue-400 to-cyan-500';
              const typeLabel = category.type === 'income' ? '📈' :
                               category.type === 'expense' ? '📉' :
                               '↔️';

              return (
                <div
                  key={category.id}
                  className={`bg-gradient-to-r ${typeGradient} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-300 group`}
                >
                  <span className="text-lg">{typeLabel}</span>
                  <span className="font-semibold">{category.name}</span>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                    title="Edit category"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded text-lg font-bold"
                    title="Delete category"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Monthly Budgets</h2>
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm"
              disabled={categories.filter((c) => c.type === "expense" || c.type === "both").length === 0}
            >
              + Add Budget
            </button>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-600 font-medium">No budgets set yet</p>
              <p className="text-gray-500 text-sm mt-1">Create budgets to track spending limits!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const category = categories.find((c) => c.id === budget.category_id);
                // Calculate spending for this category
                const spent = transactions
                  .filter((t) => t.type === "expense" && t.category_id === budget.category_id)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / budget.amount) * 100;
                const isOverBudget = spent > budget.amount;

                return (
                  <div
                    key={budget.id}
                    className="glass rounded-xl p-5 hover:scale-[1.01] transition-all duration-300 border border-white/20 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                          💵
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {category?.name || "Unknown Category"}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            <span className="font-bold text-purple-600">${spent.toFixed(2)}</span> of ${budget.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => {
                            setEditingBudget(budget);
                            setBudgetModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="Edit budget"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Delete budget"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-300/40 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                          isOverBudget
                            ? "bg-gradient-to-r from-red-500 to-pink-500"
                            : percentage > 80
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : "bg-gradient-to-r from-green-400 to-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm font-bold ${
                          isOverBudget
                            ? "text-red-600"
                            : percentage > 80
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {isOverBudget
                          ? `⚠️ Over by $${(spent - budget.amount).toFixed(2)}`
                          : `✓ ${(100 - percentage).toFixed(0)}% remaining`}
                      </p>
                      <span className="text-xs text-gray-500 font-medium">{percentage.toFixed(1)}% used</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        account={editingAccount}
        isLoading={modalLoading}
      />

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        isLoading={modalLoading}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        isLoading={modalLoading}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        budget={editingBudget}
        categories={categories}
        isLoading={modalLoading}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
