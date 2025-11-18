import React from "react";

const Select = ({ label, value, onChange, options }) => (
  <div className="input-container">
    <label>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default Select;
