import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash } from "lucide-react";
import Input from "./Input";
import Select from "./Select";

const Materials = () => {
  const [materials, setMaterials] = useState(() => {
    try { return JSON.parse(localStorage.getItem("materials")) || []; } 
    catch { return []; }
  });

  const [color, setColor] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [brand, setBrand] = useState("");
  const [otherBrand, setOtherBrand] = useState("");
  const [weight, setWeight] = useState("");

  const materialTypes = ["PLA+", "PETG", "TPU", "ABS", "Glow in the Dark"];
  const brandOptions = ["eSUN", "BambuLab", "Other"];

  useEffect(() => { localStorage.setItem("materials", JSON.stringify(materials)) }, [materials]);

  const handleAddMaterial = () => {
    if(!color || !materialType || !brand || !weight) return alert("Fill all fields");
    const finalBrand = brand==="Other"? otherBrand : brand;

    const index = materials.findIndex(m => 
      m.color.toLowerCase() === color.toLowerCase() &&
      m.materialType === materialType &&
      m.brand === finalBrand
    );

    if(index >= 0) {
      const updated = [...materials];
      updated[index].weight = (Number(updated[index].weight) + Number(weight)).toFixed(2);
      setMaterials(updated);
    } else {
      setMaterials([...materials, { 
        id: Date.now(), 
        color, 
        materialType, 
        brand: finalBrand, 
        weight: Number(weight).toFixed(2) 
      }]);
    }

    // Reset fields
    setColor(""); setMaterialType(""); setBrand(""); setOtherBrand(""); setWeight("");
  }

  const handleDelete = id => setMaterials(materials.filter(m => m.id !== id));

  return (
    <motion.div className="materials-page" initial={{opacity:0}} animate={{opacity:1}}>
      <h2>Materials</h2>

      <div className="form-row">
        <Input label="Color" value={color} onChange={setColor} placeholder="e.g. White" />
        <Select label="Material Type" value={materialType} onChange={setMaterialType} options={materialTypes} />
        <Select label="Brand" value={brand} onChange={setBrand} options={brandOptions} />
        {brand==="Other" && <Input label="Specify Brand" value={otherBrand} onChange={setOtherBrand} placeholder="Brand Name"/>}
        <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 2" />
        <button onClick={handleAddMaterial} className="btn-add"><Plus size={16}/> Add</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Color</th>
            <th>Material Type</th>
            <th>Brand</th>
            <th>Weight (kg)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {materials.length ? materials.map(m => (
            <tr key={m.id}>
              <td>{m.color}</td>
              <td>
                <select
                  value={m.materialType}
                  onChange={(e) => {
                    const updated = [...materials];
                    updated.find(mat => mat.id === m.id).materialType = e.target.value;
                    setMaterials(updated);
                  }}
                >
                  {materialTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </td>
              <td>{m.brand}</td>
              <td>
                <input
                  type="number"
                  value={m.weight}
                  onChange={(e) => {
                    const updated = [...materials];
                    updated.find(mat => mat.id === m.id).weight = Number(e.target.value).toFixed(2);
                    setMaterials(updated);
                  }}
                />
              </td>
              <td className="text-right">
                <button onClick={()=>handleDelete(m.id)} className="btn-delete"><Trash size={14}/></button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={5}>No materials yet</td></tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}

export default Materials;
