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
    category_id: number;
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
  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "Unknown";

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
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
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
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Net</p>
            <p
              className={`text-3xl font-bold ${
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
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "amount")
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
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
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionModalOpen(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              disabled={accounts.length === 0}
            >
              + New Transaction
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No transactions found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {txn.description || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getCategoryName(txn.category_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getAccountName(txn.account_id)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                          txn.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.type === "income" ? "+" : "-"}$
                        {Math.abs(txn.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => {
                            setEditingTransaction(txn);
                            setTransactionModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(txn.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️
                        </button>
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
