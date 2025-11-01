// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "@/services/api";
import type { Account, Transaction, Category } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

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
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  }[color];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <span className={`text-2xl p-2 rounded-lg border ${colorClasses}`}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function AccountCard({ account }: { account: Account }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:border-blue-400 transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-lg">{account.name}</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Active
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        ${account.balance.toFixed(2)}
      </p>
    </div>
  );
}

function TransactionRow({
  transaction,
  categories,
}: {
  transaction: Transaction;
  categories: Category[];
}) {
  const category = categories.find((c) => c.id === transaction.category_id);
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {isIncome ? "↑" : "↓"}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {transaction.description || "No description"}
          </p>
          <p className="text-sm text-gray-500">
            {category?.name || "Uncategorized"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(transaction.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError("");

      const [accountsData, transactionsData, categoriesData] =
        await Promise.all([
          api.getAccounts(user.id, token),
          api.getTransactions(user.id, token, {
            limit: 5,
            sort_by: "date",
            order: "desc",
          }),
          api.getCategories(token),
        ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);
      setCategories(categoriesData);
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
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">My Accounts</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Recent Transactions
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
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
