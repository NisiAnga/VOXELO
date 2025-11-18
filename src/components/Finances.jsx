import React, { useState, useEffect } from "react";

export default function Finance() {
  const [tab, setTab] = useState("income");

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("orders")) || [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("expenses")) || [];
    } catch {
      return [];
    }
  });

  const [billNo, setBillNo] = useState("");
  const [reason, setReason] = useState("");
  const [cost, setCost] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addExpense = () => {
    if (!billNo || !reason || !cost) return alert("Please fill all expense fields.");
    setExpenses([
      ...expenses,
      { id: Date.now(), billNo, date: expenseDate, reason, cost: Number(cost) },
    ]);
    setBillNo("");
    setReason("");
    setCost("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const incomeList = orders.map((o) => ({
    invoice: o.invoice,
    date: o.date,
    product: o.product,
    income: Number(o.price || 0),
  }));

  const totalIncome = incomeList.reduce((sum, i) => sum + i.income, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.cost), 0);
  const profit = totalIncome - totalExpenses;

  // Helper: get all dates from earliest transaction to today
  const getAllDates = () => {
    const allDates = [];
    const allTransactionDates = [...orders.map((o) => o.date), ...expenses.map((e) => e.date)];
    if (allTransactionDates.length === 0) return [new Date().toISOString().split("T")[0]];

    const minDate = new Date(Math.min(...allTransactionDates.map((d) => new Date(d))));
    const maxDate = new Date(); // today

    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split("T")[0]);
    }
    return allDates.reverse(); // latest date first
  };

  return (
    <div className="page-container">
      <h2>Finance</h2>

      <div className="finance-tabs">
        <button className={tab === "income" ? "active" : ""} onClick={() => setTab("income")}>Income</button>
        <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>Expenses</button>
        <button className={tab === "profit" ? "active" : ""} onClick={() => setTab("profit")}>Profit</button>
      </div>

      {/* INCOME PAGE */}
      {tab === "income" && (
        <div>
          <h3>Income from Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Product</th>
                <th>Income (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.length ? incomeList.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.invoice}</td>
                  <td>{i.date}</td>
                  <td>{i.product}</td>
                  <td>Rs. {i.income.toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td colSpan={4}>No income yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EXPENSES PAGE */}
      {tab === "expenses" && (
        <div>
          <h3>Add an Expense</h3>
          <div className="form-row">
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
            <input placeholder="Bill No." value={billNo} onChange={(e) => setBillNo(e.target.value)} />
            <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <input placeholder="Cost (Rs.)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            <button className="btn-add" onClick={addExpense}>Add</button>
          </div>

          <h3>Expense List</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Cost (Rs.)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.length ? expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.billNo}</td>
                  <td>
                    <input
                      type="date"
                      value={e.date}
                      onChange={(ev) => {
                        const newDate = ev.target.value;
                        setExpenses(expenses.map(exp => exp.id === e.id ? { ...exp, date: newDate } : exp));
                      }}
                    />
                  </td>
                  <td>{e.reason}</td>
                  <td>Rs. {e.cost.toFixed(2)}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteExpense(e.id)}>X</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5}>No expenses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PROFIT PAGE */}
      {tab === "profit" && (
        <div className="profit-box">
          <h3>Profit Summary by Date</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Income (Rs.)</th>
                <th>Expenses (Rs.)</th>
                <th>Balance (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {getAllDates().map((date) => {
                const income = orders.filter(o => o.date === date).reduce((sum, o) => sum + Number(o.price || 0), 0);
                const expense = expenses.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.cost), 0);
                const balance = income - expense;

                return (
                  <tr key={date}>
                    <td>
                      <input
                        type="date"
                        value={date}
                        onChange={(ev) => {
                          const newDate = ev.target.value;
                          setOrders(orders.map(o => o.date === date ? { ...o, date: newDate } : o));
                          setExpenses(expenses.map(e => e.date === date ? { ...e, date: newDate } : e));
                        }}
                      />
                    </td>
                    <td>Rs. {income.toFixed(2)}</td>
                    <td>Rs. {expense.toFixed(2)}</td>
                    <td style={{ color: balance < 0 ? "#ec4f4f" : "#4fec72" }}>Rs. {balance.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
