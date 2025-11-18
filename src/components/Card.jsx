import React from "react";
import { motion } from "framer-motion";

export default function Card({ title, icon, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card"
    >
      <div className="card-header">
        {icon && <span className="card-icon">{icon}</span>}
        {title && <div className="card-title">{title}</div>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </motion.div>
  );
}
