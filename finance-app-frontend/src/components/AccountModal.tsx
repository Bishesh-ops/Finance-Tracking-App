// src/components/AccountModal.tsx
"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Account } from "@/services/api";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; balance: number }) => Promise<void>;
  account?: Account | null;
  isLoading?: boolean;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSave,
  account,
  isLoading = false,
}: AccountModalProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(account.balance.toString());
    } else {
      setName("");
      setBalance("");
    }
    setError("");
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum)) {
      setError("Balance must be a valid number");
      return;
    }

    try {
      await onSave({ name: name.trim(), balance: balanceNum });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? "Edit Account" : "Create New Account"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Checking Account"
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Starting Balance
          </label>
          <input
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900"
            required
          />
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
