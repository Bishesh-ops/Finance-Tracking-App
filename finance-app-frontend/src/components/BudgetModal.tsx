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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || expenseCategories.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
