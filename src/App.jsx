import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

function getCategoryColor(category, opacity = 1) {
  const colors = {
    Food: `rgba(251, 146, 60, ${opacity})`,
    Transport: `rgba(59, 130, 246, ${opacity})`,
    Bills: `rgba(239, 68, 68, ${opacity})`,
    Entertainment: `rgba(168, 85, 247, ${opacity})`,
    Shopping: `rgba(236, 72, 153, ${opacity})`,
    Other: `rgba(107, 114, 128, ${opacity})`,
  };
  return colors[category] || colors["Other"];
}

function getCategoryIcon(category) {
  const icons = {
    Food: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M14 11V2h4a2 2 0 0 1 2 2v7c0 1.1-.9 2-2 2h-4Z" />
        <path d="M22 17H2a2 2 0 0 0-2 2v2h24v-2a2 2 0 0 0-2-2Z" />
      </svg>
    ),
    Transport: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h8" />
        <path d="M16 17H5" />
        <circle cx="6.5" cy="17.5" r="2.5" />
        <circle cx="16.5" cy="17.5" r="2.5" />
      </svg>
    ),
    Bills: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    Entertainment: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 8 4 4-4 4-4-4 4-4z" />
        <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM2 12h3m14 0h3" />
      </svg>
    ),
    Shopping: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    Other: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4Z" />
        <path d="M14 20a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4Z" />
        <rect width="8" height="8" x="2" y="14" rx="2" />
        <rect width="8" height="8" x="14" y="2" rx="2" />
      </svg>
    ),
  };
  return icons[category] || icons["Other"];
}

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    const storedExpenses = localStorage.getItem("expenses");
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  });
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme && (storedTheme === "dark" || storedTheme === "light")) {
      return storedTheme;
    }
    return "light";
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);

  const dataByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartCanvasRef.current && Object.keys(dataByCategory).length > 0) {
      const ctx = chartCanvasRef.current.getContext("2d");
      const labels = Object.keys(dataByCategory);
      const data = Object.values(dataByCategory);
      const backgroundColors = labels.map((label) =>
        getCategoryColor(label, 0.8)
      );

      const textColor = theme === "dark" ? "#f9fafb" : "#1f2937";

      chartInstanceRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Expenses",
              data: data,
              backgroundColor: backgroundColors,
              borderColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
                font: { family: "'Inter', sans-serif" },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [dataByCategory, theme]);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("Food");
    setEditingExpenseId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const descriptionValue = description.trim();
    const amountValue = parseFloat(amount);

    if (!descriptionValue || isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    if (editingExpenseId) {
      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) =>
          exp.id === editingExpenseId
            ? {
                id: editingExpenseId,
                description: descriptionValue,
                amount: amountValue,
                category,
              }
            : exp
        )
      );
    } else {
      setExpenses((prevExpenses) => [
        ...prevExpenses,
        {
          id: Date.now(),
          description: descriptionValue,
          amount: amountValue,
          category,
        },
      ]);
    }

    resetForm();
  };

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses((prevExpenses) =>
        prevExpenses.filter((exp) => exp.id !== id)
      );
      resetForm();
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen font-inter p-4 sm:p-6 md:p-8 transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#111827" : "#f3f4f6",
        color: isDark ? "#f9fafb" : "#1f2937",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: isDark ? "#ffffff" : "#111827" }}
          >
            Expense Tracker
          </h1>
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full shadow transition-colors duration-200"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#9ca3af" : "#6b7280",
            }}
          >
            {theme === "light" ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            )}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div
              className="rounded-xl border shadow-lg p-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                {editingExpenseId ? "Edit Expense" : "Add New Expense"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? "#111827" : "#f3f4f6",
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                      color: isDark ? "#f9fafb" : "#1f2937",
                    }}
                    placeholder="e.g., Coffee"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                    >
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border rounded-lg p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      style={{
                        backgroundColor: isDark ? "#111827" : "#f3f4f6",
                        borderColor: isDark ? "#374151" : "#e5e7eb",
                        color: isDark ? "#f9fafb" : "#1f2937",
                      }}
                      placeholder="e.g., 4.50"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                    >
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border rounded-lg p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      style={{
                        backgroundColor: isDark ? "#111827" : "#f3f4f6",
                        borderColor: isDark ? "#374151" : "#e5e7eb",
                        color: isDark ? "#f9fafb" : "#1f2937",
                      }}
                    >
                      <option>Food</option>
                      <option>Transport</option>
                      <option>Bills</option>
                      <option>Entertainment</option>
                      <option>Shopping</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {editingExpenseId ? "Update Expense" : "Add Expense"}
                  </button>
                  {editingExpenseId && (
                    <button
                      onClick={resetForm}
                      className="w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer text-white"
                      style={{
                        backgroundColor: isDark ? "#4b5563" : "#6b7280",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border shadow-lg transition-colors duration-300"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: isDark ? "#ffffff" : "#111827" }}
                >
                  Expense History
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {expenses.length === 0 ? (
                  <div
                    className="text-center p-12"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 14h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3
                      className="mt-2 text-sm font-medium"
                      style={{ color: isDark ? "#ffffff" : "#111827" }}
                    >
                      No expenses
                    </h3>
                    <p className="mt-1 text-sm">
                      Get started by adding a new expense.
                    </p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border-b last:border-b-0"
                      style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-2 rounded-full"
                          style={{
                            backgroundColor: getCategoryColor(
                              expense.category,
                              0.1
                            ),
                            color: getCategoryColor(expense.category, 1),
                          }}
                        >
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}
                          >
                            {expense.description}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                          >
                            {expense.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p
                          className="font-semibold text-lg mr-4"
                          style={{ color: isDark ? "#ffffff" : "#111827" }}
                        >
                          ${expense.amount.toFixed(2)}
                        </p>
                        <button
                          className="p-1 rounded-full transition-colors"
                          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                          onClick={() => handleEditClick(expense)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                            ></path>
                          </svg>
                        </button>
                        <button
                          className="p-1 rounded-full transition-colors"
                          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                          onClick={() => handleDeleteClick(expense.id)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div
              className="rounded-xl border shadow-lg p-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                Summary
              </h2>
              <div className="flex justify-between items-center">
                <span
                  className="text-lg"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  Total Expenses:
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: isDark ? "#818cf8" : "#4f46e5" }}
                >
                  ${totalExpenses.toFixed(2)}
                </span>
              </div>
            </div>
            <div
              className="rounded-xl border shadow-lg p-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                Spending by Category
              </h2>
              <div className="relative h-64 md:h-72 lg:h-80">
                {Object.keys(dataByCategory).length === 0 ? (
                  <div
                    className="flex items-center justify-center h-full"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    <p className="text-sm">No data to display</p>
                  </div>
                ) : (
                  <canvas ref={chartCanvasRef}></canvas>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
