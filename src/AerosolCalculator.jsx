import React, { useState, useRef } from "react";
import styles from "./AerosolCalculator.module.css";
import { calculateResults, recommendProducts } from "./resultsUtils";
import { productDetails } from "./productDetails";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AerosolCalculator() {
const [inputs, setInputs] = useState({
area: 10,
height: 3.5,
ead: 20,
safetyFactor: 1.3,
fa: 1,
trench: 0,
ceiling: 0,
floor: 0,
fireClass: "A",
});

const [result, setResult] = useState(null);
const [recommendation, setRecommendation] = useState({});
const [show, setShow] = useState(false);
const [newProductCode, setNewProductCode] = useState("");
const [newProductQty, setNewProductQty] = useState(1);

const resultRef = useRef();

const handleChange = (e) => {
const { name, value } = e.target;
setInputs((prev) => ({
...prev,
[name]: name === "fireClass" ? value : parseFloat(value),
}));
};

const handleCalculate = () => {
const res = calculateResults(inputs);
const reco = recommendProducts(res.totalAgent);
setResult(res);
setRecommendation(reco);
setShow(true);
};

const handleExportPDF = async () => {
  // Ensure the container is fully rendered before capturing
  const canvas = await html2canvas(resultRef.current, {
    scale: 2, // Increase scale for better quality
    useCORS: true, // Ensure cross-origin images are handled
    scrollY: -window.scrollY, // Capture the full content, including off-screen parts
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  // Add the main heading
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Genefire Pvt. Ltd.", width / 2, 20, { align: "center" });

  // Add contact details below the heading
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14); // Medium font size
  pdf.text("Contact Details: info@genefire.com | +91 xx xx xx xx xx", width / 2, 30, { align: "center" });

  // Add the snapshot below the heading and contact details
  pdf.addImage(imgData, "PNG", 0, 40, width, height);
  pdf.save("Aerosol_Calculator_Result.pdf");
};

const handleRemoveProduct = (code) => {
setRecommendation((prev) => {
const updated = { ...prev };
delete updated[code];
return updated;
});
};

const handleUpdateQuantity = (code, newQty) => {
if (newQty <= 0) return handleRemoveProduct(code);
setRecommendation((prev) => ({
...prev,
[code]: newQty,
}));
};

const handleAddProduct = () => {
if (newProductCode) {
setRecommendation((prev) => ({
...prev,
[newProductCode]: (prev[newProductCode] || 0) + newProductQty,
}));
setNewProductCode("");
setNewProductQty(1);
}
};

return (
<div className={styles.container}>
<div className={styles.card}>
<h1 className={styles.title}> Aerosol Suppression Calculator</h1>


    <div className={styles.grid}>
      {[
        ["Area (m²)", "area"],
        ["Height (m)", "height"],
        ["EAD (g/m³)", "ead"],
        ["Safety Factor", "safetyFactor"],
        ["Design Factor (fa)", "fa"],
        ["Trench Vol (m³)", "trench"],
        ["Ceiling Vol (m³)", "ceiling"],
        ["Floor Vol (m³)", "floor"],
      ].map(([label, key]) => (
        <label key={key} className={styles.label}>
          {label}
          <input
            type="number"
            name={key}
            className={styles.input}
            value={inputs[key]}
            onChange={handleChange}
          />
        </label>
      ))}

      <label className={styles.label}>
        Fire Class
        <select
          name="fireClass"
          className={styles.input}
          value={inputs.fireClass}
          onChange={handleChange}
        >
          <option value="A">Class A</option>
          <option value="B">Class B</option>
          <option value="C">Class C</option>
          <option value="E">Class E</option>
          <option value="E">Class F</option>
        </select>
      </label>
      <label className={styles.label}>
       Installation
        <select
          name="fireClass"
          className={styles.input}
          value={inputs.Installation}
          onChange={handleChange}
        >
          <option value="A">Room</option>
          <option value="B">Panel</option>
          <option value="C">Container</option>
          <option value="E">Other</option>
        </select>
      </label>
    
    </div>

    

    <div className={styles.buttonWrapper}>
      <button className={styles.button} onClick={handleCalculate}>
        Show Result 🔍
      </button>
      {show && (
        <button className={styles.button} onClick={handleExportPDF}>
          Export PDF 📄
        </button>
      )}
    </div>

    {show && result && (
      <div className={styles.result} ref={resultRef}>
        <h2 className={styles.resultTitle}>📊 Calculation Results</h2>
        <p><b>Room Volume:</b> {result.roomVolume.toFixed(2)} m³</p>
        <p><b>Total Volume:</b> {result.totalVolume.toFixed(2)} m³</p>
        <p><b>Design Application Density:</b> {result.da.toFixed(2)} g/m³</p>
        <p><b>Total Agent Required:</b> {result.totalAgent.toFixed(2)} g</p>

        <h3 className={styles.resultTitle}>🔥 Recommended Products</h3>
        <div className={styles.productGrid}>
          {Object.entries(recommendation).map(([code, qty]) => {
            const detail = productDetails[code];
            return (
              <div key={code} className={styles.productCard}>
                <img
                  src={`/products/${code}.png`}
                  alt={code}
                  className={styles.productImage}
                  onError={(e) => { e.target.src = "/products/placeholder.png"; }}
                />

                <div className={styles.productDetails}>
                  <div className={styles.productCode}>{code}</div>
                  <div className={styles.productQty}>
                    Qty:
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) =>
                        handleUpdateQuantity(code, parseInt(e.target.value))
                      }
                      className={styles.qtyInput}
                    />
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveProduct(code)}
                  >
                    Remove ❌
                  </button>

                  {detail && (
                    <div className={styles.techSpecs}>
                      <p><b>AGC Mass:</b> {detail.agcMass}</p>
                      <p><b>Total Weight:</b> {detail.totalMass}</p>
                      <p><b>Protected Volume:</b> {detail.volume}</p>
                      <p><b>Discharge Time:</b> {detail.time}</p>
                      <p><b>Size:</b> {detail.size}</p>
                      <p><b>Fire Class:</b> {detail.class}</p>
                      <p><b>Installation:</b> {detail.Installation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.addProductBox}>
          <h4>Add Product Manually ➕</h4>
          <div className={styles.addForm}>
            <select
              value={newProductCode}
              onChange={(e) => setNewProductCode(e.target.value)}
              className={styles.input}
            >
              <option value="">-- Select Product --</option>
              {Object.keys(productDetails).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={newProductQty}
              onChange={(e) => setNewProductQty(parseInt(e.target.value))}
              className={styles.input}
            />
            <button className={styles.button} onClick={handleAddProduct}>
              Add Product
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
}
