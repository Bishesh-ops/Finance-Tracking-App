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
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    red: "bg-rose-500",
    purple: "bg-indigo-500",
  }[color];

  return (
    <div className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-200 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600 text-xs font-semibold tracking-wide uppercase">
          {title}
        </span>
        <div className={`text-2xl p-2.5 rounded-lg ${colorClasses} shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
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
    <div className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center text-2xl shadow-sm">
            💳
          </div>
          <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
            title="Edit account"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-rose-600"
            title="Delete account"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-3xl font-extrabold text-emerald-600">
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
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm ${
            isIncome ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}
        >
          {isIncome ? "↑" : "↓"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-base">
            {transaction.description || "No description"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
              {category?.name || "Uncategorized"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(transaction.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p
          className={`font-bold text-xl ${
            isIncome ? "text-emerald-600" : "text-rose-600"
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
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-rose-600"
            title="Delete transaction"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
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
  const handleSaveCategory = async (
    name: string,
    type: "income" | "expense" | "both"
  ) => {
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
          <p className="text-white text-lg font-semibold">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="animate-slide-in">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Finance Tracker
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Welcome back,{" "}
                <span className="font-bold text-gray-900">{user?.username}</span> 👋
              </p>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 hover:shadow-md transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
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
              <svg
                className="w-6 h-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
          <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Accounts</h2>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setAccountModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm"
              >
                + Add Account
              </button>
            </div>
            {accounts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-600 font-medium">No accounts yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Create your first account to get started!
                </p>
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

          <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-200">
                   
            <div className="flex justify-between items-center mb-4">
                       
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Transactions
              </h2>
                   
              <div className="flex items-center gap-4">
                       
                <Link
                  href="/transactions"
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm"
                >
                  View All
                </Link>
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setTransactionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm"
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

        <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm"
            >
              + Add Category
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const typeColor =
                category.type === "income"
                  ? "bg-emerald-500"
                  : category.type === "expense"
                  ? "bg-rose-500"
                  : "bg-blue-500";
              const typeLabel =
                category.type === "income"
                  ? "📈"
                  : category.type === "expense"
                  ? "📉"
                  : "↔️";

              return (
                <div
                  key={category.id}
                  className={`${typeColor} text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 group`}
                >
                  <span className="text-sm">{typeLabel}</span>
                  <span className="font-semibold">{category.name}</span>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                    title="Edit category"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
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

        <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Monthly Budgets
            </h2>
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-sm"
              disabled={
                categories.filter(
                  (c) => c.type === "expense" || c.type === "both"
                ).length === 0
              }
            >
              + Add Budget
            </button>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-600 font-medium">No budgets set yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create budgets to track spending limits!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const category = categories.find(
                  (c) => c.id === budget.category_id
                );
                // Calculate spending for this category
                const spent = transactions
                  .filter(
                    (t) =>
                      t.type === "expense" &&
                      t.category_id === budget.category_id
                  )
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / budget.amount) * 100;
                const isOverBudget = spent > budget.amount;

                return (
                  <div
                    key={budget.id}
                    className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-white/20 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center text-2xl shadow-md">
                          💵
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {category?.name || "Unknown Category"}
                          </h3>
                          <p className="text-sm text-gray-700 font-medium">
                            <span className="font-bold text-gray-900">
                              ${spent.toFixed(2)}
                            </span>{" "}
                            of ${budget.amount.toFixed(2)}
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
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-rose-600"
                          title="Delete budget"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? "bg-rose-500"
                            : percentage > 80
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm font-bold ${
                          isOverBudget
                            ? "text-rose-600"
                            : percentage > 80
                            ? "text-yellow-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {isOverBudget
                          ? `⚠️ Over by $${(spent - budget.amount).toFixed(2)}`
                          : `✓ ${(100 - percentage).toFixed(0)}% remaining`}
                      </p>
                      <span className="text-xs text-gray-500 font-medium">
                        {percentage.toFixed(1)}% used
                      </span>
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
