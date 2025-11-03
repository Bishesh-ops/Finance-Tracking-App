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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Finance Tracker
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.username}!
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error: {error}
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
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">My Accounts</h2>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setAccountModalOpen(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Account
              </button>
            </div>
            {accounts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No accounts yet. Create your first account!
              </p>
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

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                   
            <div className="flex justify-between items-center mb-4">
                       
              <h2 className="text-xl font-bold text-gray-800">
                Recent Transactions
              </h2>
                   
              <div className="flex items-center gap-4">
                       
                <Link
                  href="/transactions"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setTransactionModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Category
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const typeColor = category.type === 'income' ? 'bg-green-100 text-green-800' :
                                category.type === 'expense' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800';
              const typeLabel = category.type === 'income' ? '📈' :
                               category.type === 'expense' ? '📉' :
                               '↔️';

              return (
                <div
                  key={category.id}
                  className={`${typeColor} px-4 py-2 rounded-full flex items-center gap-2`}
                >
                  <span className="text-sm">{typeLabel}</span>
                  <span>{category.name}</span>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryModalOpen(true);
                    }}
                    className="hover:opacity-70 text-xs"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="hover:opacity-70 text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Monthly Budgets</h2>
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              disabled={categories.filter((c) => c.type === "expense" || c.type === "both").length === 0}
            >
              + Add Budget
            </button>
          </div>
          {budgets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No budgets set yet. Create budgets to track spending limits!
            </p>
          ) : (
            <div className="space-y-3">
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
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {category?.name || "Unknown Category"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBudget(budget);
                            setBudgetModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          isOverBudget
                            ? "bg-red-600"
                            : percentage > 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        isOverBudget
                          ? "text-red-600"
                          : percentage > 80
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {isOverBudget
                        ? `Over budget by $${(spent - budget.amount).toFixed(2)}`
                        : `${(100 - percentage).toFixed(0)}% remaining`}
                    </p>
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
