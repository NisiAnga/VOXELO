import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash } from "lucide-react";
import Input from "./Input";
import Select from "./Select";

const Orders = () => {
  const [materials, setMaterials] = useState(() => {
    try { return JSON.parse(localStorage.getItem("materials")) || [] }
    catch { return [] }
  });

  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orders")) || [] }
    catch { return [] }
  });

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [status, setStatus] = useState("Pending");
  const [printTime, setPrintTime] = useState("");
  const [price, setPrice] = useState("");

  const [materialList, setMaterialList] = useState([{ filament: "", materialType: "", brand: "", weight: "" }]);

  useEffect(() => { localStorage.setItem("orders", JSON.stringify(orders)) }, [orders]);
  useEffect(() => { localStorage.setItem("materials", JSON.stringify(materials)) }, [materials]);

  const statusOptions = ["Pending", "Delivery awaiting", "Delivered", "Completed", "Return"];
  const productOptions = [
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

  const brandOptions = ["eSUN", "BambuLab", "Other"];

  const materialTypes = ["PLA+", "PETG", "TPU", "ABS", "Glow in the Dark"];

  const updateMaterial = (index, key, value) => {
    const list = [...materialList];
    list[index][key] = value;
    setMaterialList(list);
  };

  const addMaterialRow = () =>
    setMaterialList([...materialList, { filament: "", materialType: "", brand: "", weight: "" }]);

  const removeMaterialRow = (index) => {
    if (materialList.length > 1)
      setMaterialList(materialList.filter((_, i) => i !== index));
  };

  const generateInvoice = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    const monthlyOrders =
      orders.filter(
        (o) =>
          new Date(o.date).getMonth() + 1 === month &&
          new Date(o.date).getFullYear() === year
      ).length + 1;

    return `#${String(monthlyOrders).padStart(3, "0")}${String(day).padStart(
      2,
      "0"
    )}${String(month).padStart(2, "0")}${year}`;
  };

  const addOrder = () => {
    // Validate material stock
    for (const m of materialList) {
      if (!m.filament || !m.materialType || !m.brand || !m.weight)
        return alert("Fill all fields for materials");

      const stock = materials.find(mat =>
        mat.color === m.filament &&
        mat.materialType === m.materialType &&
        mat.brand === m.brand
      );

      if (!stock) return alert(`Material ${m.filament} (${m.materialType}) with brand ${m.brand} not found`);
      if (Number(m.weight) > Number(stock.weight))
        return alert(`Not enough ${m.filament} (${m.materialType}) of brand ${m.brand} in stock`);
    }

    // Deduct from materials
    const updatedMaterials = materials.map(mat => {
      const used = materialList.find(m =>
        m.filament === mat.color &&
        m.materialType === mat.materialType &&
        m.brand === mat.brand
      );
      return used
        ? { ...mat, weight: (Number(mat.weight) - Number(used.weight)).toFixed(2) }
        : mat;
    });
    setMaterials(updatedMaterials);

    // Create order
    const invoice = generateInvoice();
    const date = new Date().toISOString().split("T")[0];

    setOrders([
      ...orders,
      {
        id: Date.now(),
        invoice,
        date,
        customer,
        product,
        status,
        printTime,
        price,
        materials: [...materialList],
      },
    ]);

    // reset
    setCustomer("");
    setProduct("");
    setStatus("Pending");
    setPrintTime("");
    setPrice("");
    setMaterialList([{ filament: "", materialType: "", brand: "", weight: "" }]);
  };

  const handleDelete = (id) => setOrders(orders.filter((o) => o.id !== id));

  // Filter unique colors and brands for dropdowns
  const uniqueColors = [...new Set(materials.map(m => m.color))];
  const uniqueBrands = [...new Set(materials.map(m => m.brand))];

  return (
    <motion.div className="orders-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>Orders</h2>

      {/* Order fields */}
      <div className="form-row">
        <Input label="Customer" value={customer} onChange={setCustomer} placeholder="e.g. Nimal" />
        <Select label="Product" value={product} onChange={setProduct} options={productOptions} />
      </div>

      <div className="form-row">
        <Input label="Print Time" value={printTime} onChange={setPrintTime} placeholder="e.g. 5h 30min" />
      </div>

      {/* Materials */}
      {materialList.map((row, index) => (
        <div className="form-row" key={index}>
          <Select
            label="Filament Color"
            value={row.filament}
            onChange={(v) => updateMaterial(index, "filament", v)}
            options={uniqueColors}
          />
          <Select
            label="Material Type"
            value={row.materialType}
            onChange={(v) => updateMaterial(index, "materialType", v)}
            options={materialTypes}
          />
          <Select
            label="Brand"
            value={row.brand}
            onChange={(v) => updateMaterial(index, "brand", v)}
            options={uniqueBrands.length ? uniqueBrands : brandOptions}
          />
          <Input
            label="Weight (kg)"
            value={row.weight}
            onChange={(v) => updateMaterial(index, "weight", v)}
            placeholder="0.5"
          />
          <button onClick={() => removeMaterialRow(index)} className="btn-delete">
            <Trash size={14} />
          </button>
        </div>
      ))}

      <button onClick={addMaterialRow} className="btn-add">
        <Plus size={16} /> Add Material
      </button>

      <div className="form-row">
        <Input label="Price (Rs)" value={price} onChange={setPrice} placeholder="e.g. 2500.00" />
      </div>

      <button onClick={addOrder} className="btn-add mt-2">
        <Plus size={16} /> Add Order
      </button>

      {/* Orders Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Status</th>
            <th>Materials</th>
            <th>Print Time</th>
            <th>Price (Rs)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.length ? (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.invoice}</td>
                <td>
                  <input
                    type="date"
                    value={o.date}
                    onChange={(e) =>
                      setOrders(
                        orders.map((ord) =>
                          ord.id === o.id ? { ...ord, date: e.target.value } : ord
                        )
                      )
                    }
                  />
                </td>
                <td>{o.customer}</td>
                <td>
                  <select
                    value={o.product}
                    onChange={(e) =>
                      setOrders(
                        orders.map((ord) =>
                          ord.id === o.id ? { ...ord, product: e.target.value } : ord
                        )
                      )
                    }
                  >
                    {productOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) =>
                      setOrders(
                        orders.map((ord) =>
                          ord.id === o.id ? { ...ord, status: e.target.value } : ord
                        )
                      )
                    }
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {o.materials.map((m, i) => (
                    <div key={i}>
                      {m.filament} ({m.materialType}) - {m.brand}: {m.weight} kg
                    </div>
                  ))}
                </td>
                <td>
                  <input
                    type="text"
                    value={o.printTime || ""}
                    onChange={(e) =>
                      setOrders(
                        orders.map((ord) =>
                          ord.id === o.id ? { ...ord, printTime: e.target.value } : ord
                        )
                      )
                    }
                    placeholder="0h 00min"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={o.price || ""}
                    onChange={(e) =>
                      setOrders(
                        orders.map((ord) =>
                          ord.id === o.id ? { ...ord, price: e.target.value } : ord
                        )
                      )
                    }
                    placeholder="0.00"
                  />
                </td>
                <td className="text-right">
                  <button onClick={() => handleDelete(o.id)} className="btn-delete">
                    <Trash size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>No orders yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default Orders;
