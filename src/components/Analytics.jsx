import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from "recharts";

export default function Analytics() {
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orders")) || []; }
    catch { return []; }
  });

  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("expenses")) || []; }
    catch { return []; }
  });

  const [incomeSpan, setIncomeSpan] = useState("Daily");
  const [expenseSpan, setExpenseSpan] = useState("Daily");
  const [profitSpan, setProfitSpan] = useState("Daily");

  const productTypes = [
    "Lithophane (White)",
    "Lithophane (Colored)",
    "Line Arts",
    "Keychains",
    "Mini Figures (personal)",
    "Mini Figures",
    "Lamps",
    "Table Tops",
    "3D Printing Service",
    "Others"
  ];

  // --- Format helpers ---
  const formatDate = dateStr => dateStr;
  const formatMonth = dateStr => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };
  const formatYear = dateStr => new Date(dateStr).getFullYear();

  // --- Dynamic Income Data ---
  const getIncomeData = () => {
    const map = {};
    orders.forEach(o => {
      let key;
      if(incomeSpan === "Daily") key = formatDate(o.date);
      else if(incomeSpan === "Monthly") key = formatMonth(o.date);
      else key = formatYear(o.date);

      map[key] = (map[key] || 0) + Number(o.price || 0);
    });
    return Object.keys(map).sort().map(k => ({ x: k, income: map[k] }));
  };

  // --- Dynamic Expense Data ---
  const getExpenseData = () => {
    const map = {};
    expenses.forEach(e => {
      let key;
      if(expenseSpan === "Daily") key = formatDate(e.date);
      else if(expenseSpan === "Monthly") key = formatMonth(e.date);
      else key = formatYear(e.date);

      map[key] = (map[key] || 0) + Number(e.cost || 0);
    });
    return Object.keys(map).sort().map(k => ({ x: k, expense: map[k] }));
  };

  // --- Dynamic Profit Data ---
  const getProfitData = () => {
    const map = {};
    // Aggregate income
    orders.forEach(o => {
      let key;
      if(profitSpan === "Daily") key = formatDate(o.date);
      else if(profitSpan === "Monthly") key = formatMonth(o.date);
      else key = formatYear(o.date);

      map[key] = map[key] || { income: 0, expense: 0 };
      map[key].income += Number(o.price || 0);
    });
    // Aggregate expenses
    expenses.forEach(e => {
      let key;
      if(profitSpan === "Daily") key = formatDate(e.date);
      else if(profitSpan === "Monthly") key = formatMonth(e.date);
      else key = formatYear(e.date);

      map[key] = map[key] || { income: 0, expense: 0 };
      map[key].expense += Number(e.cost || 0);
    });

    return Object.keys(map).sort().map(k => ({
      x: k,
      profit: (map[k].income || 0) - (map[k].expense || 0)
    }));
  };

  // --- Monthly Product Sales (unchanged) ---
  const monthlyProductMap = {};
  orders.forEach(o => {
    const month = new Date(o.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    monthlyProductMap[month] = monthlyProductMap[month] || {};
    monthlyProductMap[month][o.product] = (monthlyProductMap[month][o.product] || 0) + 1;
  });

  const monthlyProductCharts = Object.keys(monthlyProductMap).sort().map(month => {
    const data = productTypes.map(pt => ({
      product: pt,
      sold: monthlyProductMap[month][pt] || 0
    }));
    return { month, data };
  });

  // --- Annual Product Sales (unchanged) ---
  const annualProductMap = {};
  orders.forEach(o => {
    const year = new Date(o.date).getFullYear();
    annualProductMap[year] = annualProductMap[year] || {};
    annualProductMap[year][o.product] = (annualProductMap[year][o.product] || 0) + 1;
  });

  const annualProductCharts = Object.keys(annualProductMap).sort().map(year => {
    const data = productTypes.map(pt => ({
      product: pt,
      sold: annualProductMap[year][pt] || 0
    }));
    return { year, data };
  });

  return (
    <div className="page-container">
      <h2>Analytics Dashboard</h2>

      {/* Dynamic Income Chart */}
      <div>
        <h3>Income ({incomeSpan})</h3>
        <select value={incomeSpan} onChange={e => setIncomeSpan(e.target.value)}>
          <option>Daily</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
        <BarChart width={800} height={250} data={getIncomeData()}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#ec724f" />
        </BarChart>
      </div>

      {/* Dynamic Expense Chart */}
      <div>
        <h3>Expenses ({expenseSpan})</h3>
        <select value={expenseSpan} onChange={e => setExpenseSpan(e.target.value)}>
          <option>Daily</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
        <BarChart width={800} height={250} data={getExpenseData()}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="expense" fill="#ec724f" />
        </BarChart>
      </div>

      {/* Dynamic Profit Chart */}
      <div>
        <h3>Profit ({profitSpan})</h3>
        <select value={profitSpan} onChange={e => setProfitSpan(e.target.value)}>
          <option>Daily</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
        <LineChart width={800} height={250} data={getProfitData()}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="profit" stroke="#ec724f" />
        </LineChart>
      </div>

      {/* Monthly Product Sales Charts */}
      <h3>Monthly Product Sales</h3>
      {monthlyProductCharts.map(chart => (
        <div key={chart.month}>
          <h4>{chart.month} sales</h4>
          <BarChart width={900} height={300} data={chart.data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sold" fill="#ec724f" />
          </BarChart>
        </div>
      ))}
      {/* Monthly Product Sales Table */}
      <h4>Monthly Product Sales Table</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            {productTypes.map(pt => <th key={pt}>{pt}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.keys(monthlyProductMap).sort().map(month => (
            <tr key={month}>
              <td>{month}</td>
              {productTypes.map(pt => <td key={pt}>{monthlyProductMap[month][pt] || 0}</td>)}
            </tr>
          ))}
        </tbody>
      </table>


      {/* Annual Product Sales Charts */}
      <h3>Annual Product Sales</h3>
      {annualProductCharts.map(chart => (
        <div key={chart.year}>
          <h4>{chart.year} sales</h4>
          <BarChart width={900} height={300} data={chart.data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sold" fill="#ec724f" />
          </BarChart>
        </div>
      ))}

    {/* Annual Product Sales Table */}
      <h4>Annual Product Sales Table</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Year</th>
            {productTypes.map(pt => <th key={pt}>{pt}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.keys(annualProductMap).sort().map(year => (
            <tr key={year}>
              <td>{year}</td>
              {productTypes.map(pt => <td key={pt}>{annualProductMap[year][pt] || 0}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
