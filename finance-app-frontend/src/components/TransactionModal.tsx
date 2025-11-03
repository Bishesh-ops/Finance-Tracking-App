"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Transaction, Account, Category } from "@/services/api";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    type: "income" | "expense";
    description?: string;
    date?: string;
    account_id: number;
    category_id?: number | null;
  }) => Promise<void>;
  transaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  isLoading?: boolean;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  accounts,
  categories,
  isLoading = false,
}: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === "both"
  );

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setType(transaction.type);
      setDescription(transaction.description || "");
      setDate(transaction.date.split("T")[0]);
      setAccountId(transaction.account_id.toString());
      setCategoryId(transaction.category_id?.toString() || "");
    } else {
      setAmount("");
      setType("expense");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId(accounts[0]?.id.toString() || "");
      // Set first matching category for the default type
      const defaultCategories = categories.filter(
        (cat) => cat.type === "expense" || cat.type === "both"
      );
      setCategoryId(defaultCategories[0]?.id.toString() || "");
    }
    setError("");
  }, [transaction, isOpen, accounts, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (!accountId) {
      setError("Please select an account");
      return;
    }

    try {
      await onSave({
        amount: amountNum,
        type,
        description: description.trim() || undefined,
        date: date || undefined,
        account_id: parseInt(accountId),
        category_id: categoryId ? parseInt(categoryId) : null,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save transaction"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Edit Transaction" : "New Transaction"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                checked={type === "income"}
                onChange={(e) => {
                  const newType = e.target.value as "income" | "expense";
                  setType(newType);
                  // Reset category when type changes
                  const matchingCategories = categories.filter(
                    (cat) => cat.type === newType || cat.type === "both"
                  );
                  setCategoryId(matchingCategories[0]?.id.toString() || "");
                }}
                disabled={isLoading}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">Income</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                checked={type === "expense"}
                onChange={(e) => {
                  const newType = e.target.value as "income" | "expense";
                  setType(newType);
                  // Reset category when type changes
                  const matchingCategories = categories.filter(
                    (cat) => cat.type === newType || cat.type === "both"
                  );
                  setCategoryId(matchingCategories[0]?.id.toString() || "");
                }}
                disabled={isLoading}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">Expense</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
            required
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category {type === "income" && <span className="text-gray-500 text-xs">(Optional)</span>}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
          >
            {type === "income" && (
              <option value="">None (Uncategorized)</option>
            )}
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {filteredCategories.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No categories available for {type}. Create one first!
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Grocery shopping"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
          />
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
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
