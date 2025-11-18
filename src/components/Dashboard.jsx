import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, Layers } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import CountUp from "react-countup";

const Dashboard = () => {
  // ---------------- States ----------------
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orders")) || []; } 
    catch { return []; }
  });
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("expenses")) || []; } 
    catch { return []; }
  });
  const [materials, setMaterials] = useState(() => {
    try { return JSON.parse(localStorage.getItem("materials")) || []; }
    catch { return []; }
  });

  // ---------------- Time Span States ----------------
  const [incomeSpan, setIncomeSpan] = useState("Day");
  const [expensesSpan, setExpensesSpan] = useState("Day");
  const [profitSpan, setProfitSpan] = useState("Day");

  // ---------------- Metrics ----------------
  const totalIncome = orders.reduce((sum, o) => sum + Number(o.price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== "Completed").length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;

  // ---------------- Helpers ----------------
  const formatDate = (dateStr) => new Date(dateStr).toISOString().split("T")[0];
  const formatMonth = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const formatYear = (dateStr) => new Date(dateStr).getFullYear().toString();

  const aggregateData = (data, key, span) => {
    const map = {};
    data.forEach(item => {
      let groupKey = item.date;
      if (span === "Month") groupKey = formatMonth(item.date);
      if (span === "Year") groupKey = formatYear(item.date);
      map[groupKey] = (map[groupKey] || 0) + Number(item[key] || 0);
    });
    return Object.keys(map)
      .sort((a,b) => new Date(a) - new Date(b))
      .map(k => ({ name: k, [key]: map[k] }));
  };

  const incomeData = aggregateData(orders.map(o => ({ date: o.date, income: Number(o.price || 0) })), "income", incomeSpan);
  const expensesData = aggregateData(expenses.map(e => ({ date: e.date, expense: Number(e.cost || 0) })), "expense", expensesSpan);

  // Profit is income - expense per group
  const profitData = (() => {
    const allDates = new Set([...orders.map(o=>o.date), ...expenses.map(e=>e.date)]);
    const dataMap = {};
    allDates.forEach(d => {
      let key = d;
      if (profitSpan === "Month") key = formatMonth(d);
      if (profitSpan === "Year") key = formatYear(d);
      const dailyIncome = orders.filter(o => {
        if (profitSpan === "Day") return o.date === d;
        if (profitSpan === "Month") return formatMonth(o.date) === key;
        if (profitSpan === "Year") return formatYear(o.date) === key;
      }).reduce((sum,o)=>sum+Number(o.price||0),0);

      const dailyExpense = expenses.filter(e => {
        if (profitSpan === "Day") return e.date === d;
        if (profitSpan === "Month") return formatMonth(e.date) === key;
        if (profitSpan === "Year") return formatYear(e.date) === key;
      }).reduce((sum,e)=>sum+Number(e.cost||0),0);

      dataMap[key] = dailyIncome - dailyExpense;
    });
    return Object.keys(dataMap)
      .sort((a,b)=> new Date(a)-new Date(b))
      .map(k => ({ name: k, profit: dataMap[k] }));
  })();

  return (
    <motion.div className="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* ---------------- Metrics Cards ---------------- */}
      <div className="dashboard-grid">
        {/* Row 1 */}
        <div className="dashboard-card: scale-105 transition-transform shadow-md p-4 rounded-xl">
          <div className="dashboard-card h3">
            <DollarSign size={18}/> <b>Total Income</b><br/>
            <CountUp end={totalIncome} duration={1.5} separator="," prefix="LKR " />
          </div>
        </div>

        <div className="dashboard-card: scale-105 transition-transform shadow-md p-4 rounded-xl">
          <div className="dashboard-card h3">
            <DollarSign size={18}/> <b>Total Expenses</b><br/>
            <CountUp end={totalExpenses} duration={1.5} separator="," prefix="LKR " />
          </div>
        </div>

        {/* Row 2 */}
        <div className="dashboard-card: scale-105 transition-transform shadow-md p-4 rounded-xl">
          <div className="dashboard-card h3">
            <Package size={18}/> <b>Orders Pending</b><br/>
            <CountUp end={pendingOrders} duration={1.5} />
          </div>
        </div>

        <div className="dashboard-card: scale-105 transition-transform shadow-md p-4 rounded-xl">
          <div className="dashboard-card h3">
            <Package size={18}/> <b>Orders Completed</b><br/>
            <CountUp end={completedOrders} duration={1.5} />
          </div>
        </div>

        {/* Row 3 - Materials Remaining */}
        <div className="dashboard-card2: scale-105 transition-transform shadow-md p-4 rounded-xl col-span-2">
          <div className="dashboard-card h3">
            <Layers size={18}/> <b>Materials Remaining</b>
            <div className="mt-2 overflow-y-auto max-h-64">
              {materials.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-300">
                      <th className="pb-1">Color</th>
                      <th className="pb-1">Material Type</th>
                      <th className="pb-1">Brand</th>
                      <th className="pb-1 text-right">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, i) => (
                      <tr key={i} className="border-b border-gray-200 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td>{m.color}</td>
                        <td>{m.materialType}</td>
                        <td>{m.brand}</td>
                        <td className="text-right">{Number(m.weight).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-gray-500 mt-2">No materials added</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Analytics Charts ---------------- */}
      <div className="analytics-grid">

        <div className="chart-card">
          <div className="chart-header">
            <h4>Income Analytics</h4>
            <select value={incomeSpan} onChange={e=>setIncomeSpan(e.target.value)}>
              <option>Day</option>
              <option>Month</option>
              <option>Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="income" stroke="#ec724f"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>Expenses Analytics</h4>
            <select value={expensesSpan} onChange={e=>setExpensesSpan(e.target.value)}>
              <option>Day</option>
              <option>Month</option>
              <option>Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={expensesData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="expense" stroke="#ec724f"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>Profit Analytics</h4>
            <select value={profitSpan} onChange={e=>setProfitSpan(e.target.value)}>
              <option>Day</option>
              <option>Month</option>
              <option>Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="profit" stroke="#ec724f"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
