// src/app/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "@/services/api";
import type { Account, Transaction, Category } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionModal from "@/components/TransactionModal";
import Link from "next/link";

function TransactionsContent() {
  const { user, token, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await loadData();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterType,
    filterCategory,
    filterAccount,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  async function loadData() {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError("");

      const [transData, accData, catData] = await Promise.all([
        api.getTransactions(user.id, token, {
          transaction_type:
            filterType === "all"
              ? undefined
              : (filterType as "income" | "expense"),
          category_id:
            filterCategory === "all" ? undefined : parseInt(filterCategory),
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort_by: sortBy,
          order: sortOrder,
          limit: 100,
        }),
        api.getAccounts(user.id, token),
        api.getCategories(token),
      ]);

      // Filter by account client-side (since API doesn't support it)
      let filtered = transData;
      if (filterAccount !== "all") {
        filtered = transData.filter(
          (t) => t.account_id === parseInt(filterAccount)
        );
      }

      setTransactions(filtered);
      setAccounts(accData);
      setCategories(catData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      if (errorMessage === "UNAUTHORIZED") logout();
    } finally {
      setLoading(false);
    }
  }

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
      await loadData();
      setEditingTransaction(null);
    } catch (error) {
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!user || !token || !confirm("Delete this transaction?")) return;

    try {
      await api.deleteTransaction(user.id, id, token);
      await loadData();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  const getAccountName = (id: number) =>
    accounts.find((a) => a.id === id)?.name || "Unknown";
  const getCategoryName = (id: number | null) =>
    id ? (categories.find((c) => c.id === id)?.name || "Unknown") : "Uncategorized";

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
          <p className="text-white text-lg font-semibold">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl hover:bg-white/30 text-gray-800 font-bold transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                All Transactions
              </h1>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-sm font-semibold tracking-wide uppercase">Total Income</span>
              <div className="text-3xl p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                📈
              </div>
            </div>
            <p className="text-4xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-sm font-semibold tracking-wide uppercase">Total Expenses</span>
              <div className="text-3xl p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-400 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                📉
              </div>
            </div>
            <p className="text-4xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-sm font-semibold tracking-wide uppercase">Net</span>
              <div className={`text-3xl p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
                totalIncome - totalExpenses >= 0
                  ? "bg-gradient-to-br from-blue-500 to-cyan-400"
                  : "bg-gradient-to-br from-orange-500 to-red-400"
              }`}>
                💰
              </div>
            </div>
            <p
              className={`text-4xl font-bold ${
                totalIncome - totalExpenses >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${(totalIncome - totalExpenses).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-6 mb-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Filters & Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Account
              </label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
              >
                <option value="all">All</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Sort
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "amount")
                  }
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-purple-100 hover:border-purple-400 text-gray-900 font-bold transition-all duration-200 bg-white/90"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => {
                setFilterType("all");
                setFilterCategory("all");
                setFilterAccount("all");
                setStartDate("");
                setEndDate("");
                setSortBy("date");
                setSortOrder("desc");
              }}
              className="px-5 py-2.5 rounded-xl text-purple-700 font-semibold hover:bg-purple-100 transition-all duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
              disabled={accounts.length === 0}
            >
              + New Transaction
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-700 font-semibold text-lg">No transactions found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or create a new transaction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 border-b-2 border-white/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-white/30 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {txn.description || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 font-semibold text-xs">
                          {getCategoryName(txn.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {getAccountName(txn.account_id)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                          txn.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.type === "income" ? "+" : "-"}$
                        {Math.abs(txn.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              setEditingTransaction(txn);
                              setTransactionModalOpen(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="Edit transaction"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(txn.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                            title="Delete transaction"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}
