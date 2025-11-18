import React from "react";

const Input = ({ label, value, onChange, placeholder, type="text" }) => (
  <div className="input-container">
    <label>{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
    />
  </div>
);

export default Input;
