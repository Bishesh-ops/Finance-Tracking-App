// src/components/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Category } from "@/services/api";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: 'income' | 'expense' | 'both') => Promise<void>;
  category?: Category | null;
  isLoading?: boolean;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  isLoading = false,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
    } else {
      setName("");
      setType('expense');
    }
    setError("");
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      await onSave(name.trim(), type);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Create New Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries, Salary, Utilities"
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense' | 'both')}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both (Income & Expense)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {type === 'expense' && 'For tracking spending (groceries, rent, etc.)'}
            {type === 'income' && 'For tracking earnings (salary, freelance, etc.)'}
            {type === 'both' && 'Can be used for both income and expenses (e.g., Transfer)'}
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
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
