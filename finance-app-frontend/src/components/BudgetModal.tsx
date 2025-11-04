// src/components/BudgetModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Modal from "./Modal";
import { Budget, Category } from "@/services/api";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, categoryId: number, period?: string) => Promise<void>;
  budget?: Budget | null;
  categories: Category[];
  isLoading?: boolean;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  budget,
  categories,
  isLoading = false,
}: BudgetModalProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [error, setError] = useState("");

  // Filter categories to only show expense categories (budgets are for tracking spending)
  // Use useMemo to prevent creating new array reference on every render
  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === "expense" || cat.type === "both"),
    [categories]
  );

  useEffect(() => {
    if (budget) {
      setAmount(budget.amount.toString());
      setCategoryId(budget.category_id.toString());
      setPeriod(budget.period || "monthly");
    } else {
      setAmount("");
      setCategoryId(expenseCategories[0]?.id.toString() || "");
      setPeriod("monthly");
    }
    setError("");
  }, [budget, isOpen, expenseCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);

    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    try {
      await onSave(amountNum, parseInt(categoryId), period);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? "Edit Budget" : "Create New Budget"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 500.00"
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Set a spending limit for this category
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoading || budget !== null}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300"
            required
          >
            {expenseCategories.length === 0 && (
              <option value="">No expense categories available</option>
            )}
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {budget && (
            <p className="text-sm text-gray-500 mt-1">
              Category cannot be changed after creation
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300"
            required
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly (Coming Soon)</option>
            <option value="yearly">Yearly (Coming Soon)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Currently only monthly budgets are supported
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || expenseCategories.length === 0}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
