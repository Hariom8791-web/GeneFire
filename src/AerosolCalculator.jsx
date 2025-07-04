import React, { useState, useRef } from "react";
import styles from "./AerosolCalculator.module.css";
import { calculateResults, recommendProducts } from "./resultsUtils";
import { productDetails } from "./productDetails";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AerosolCalculator() {
  // Form inputs state
  const [inputs, setInputs] = useState({
    length: 2,
    breadth: 5,
    height: 3.5,
    ceilingHeight: 0.5,
    trenchLength: 2,
    trenchWidth: 2,
    trenchHeight: 0.5,
    ead: 20,
    safetyFactor: 1.3,
    fa: 1,
    fireClass: "A",
    installation: "Room"
  });

  // Results and UI state
  const[setinstallation, setInstallation] = useState("Room");
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState({});
  const [roomTotalAgent, setRoomTotalAgent] = useState({});
  const [trenchTotalAgent, setTrenchTotalAgent] = useState({});
  const [ceilingTotalAgent, setCeilingTotalAgent] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [newProductCode, setNewProductCode] = useState("");
  const [newProductQty, setNewProductQty] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const[roomagentreq, setRoomAgentReq] = useState(0);
  const [trenchagentreq, setTrenchAgentReq] = useState(0);
  const [ceilingagentreq, setCeilingAgentReq] = useState(0);
  const resultRef = useRef();
  const [selectedSection, setSelectedSection] = useState("");

  // Handle input changes
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setInputs(prev => ({
  //     ...prev,
  //     [name]: name === "fireClass" || name === "installation" 
  //       ? value 
  //       : parseFloat(value) || 0
  //   }));
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setInputs((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value) || 0, // Set blank if input is empty
    }));
  };
  const handleAddProduct = () => {
    if (newProductCode && selectedSection) {
      if (selectedSection === "room") {
        setRoomTotalAgent((prev) => ({
          ...prev,
          [newProductCode]: (prev[newProductCode] || 0) + newProductQty,
        }));
      } else if (selectedSection === "trench") {
        setTrenchTotalAgent((prev) => ({
          ...prev,
          [newProductCode]: (prev[newProductCode] || 0) + newProductQty,
        }));
      } else if (selectedSection === "ceiling") {
        setCeilingTotalAgent((prev) => ({
          ...prev,
          [newProductCode]: (prev[newProductCode] || 0) + newProductQty,
        }));
      }

      setNewProductCode("");
      setNewProductQty(1);
      setSelectedSection("");
    } else {
      alert("Please select a section and product.");
    }
  };
  // Calculate results
  const handleCalculate = () => {
    setIsCalculating(true);

    try {
      const height = inputs.height;
      const ead = inputs.ead;
      const safetyFactor = inputs.safetyFactor;
      const fa = inputs.fa;

      const area = inputs.length * inputs.breadth;
      const roomVolume = area * inputs.height;
      const ceilingVolume = area * inputs.ceilingHeight;
      const trenchVolume = inputs.trenchLength * inputs.trenchWidth * inputs.trenchHeight;
      const totalVolume = roomVolume + ceilingVolume + trenchVolume;

      const updatedInputs = {
        ...inputs,
        area,
        height,
        ead,
        safetyFactor,
        fa,
        trench: trenchVolume,
        ceiling: ceilingVolume,
        room: roomVolume,
      };
      setInstallation(inputs.installation);
      const installation = inputs.installation;
      const res = calculateResults(updatedInputs);
      const reco = recommendProducts(res.totalAgent);
      const roomAgent = recommendProducts(res.RoomtotalAgent);
      const trenchAgent = recommendProducts(res.TrenchtotalAgent);
      const ceilingAgent = recommendProducts(res.CeilingtotalAgent);
      setRoomAgentReq(res.RoomtotalAgent);
      setTrenchAgentReq(res.TrenchtotalAgent);  
      setCeilingAgentReq(res.CeilingtotalAgent);
      console.log(res.RoomtotalAgent, "Room Total Agent");
      console.log(res.TrenchtotalAgent, "Trench Total Agent");
      console.log(res.CeilingtotalAgent, "Ceiling Total Agent");


      console.log("Room Total Agent:", roomAgent);
      console.log("Trench Total Agent:", trenchAgent);
      console.log("Ceiling Total Agent:", ceilingAgent);

      setResult(res);
      setRecommendation(reco);
      setRoomTotalAgent(roomAgent);
      setTrenchTotalAgent(trenchAgent);
      setCeilingTotalAgent(ceilingAgent);

      setShowResults(true);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("An error occurred during calculation. Please check your inputs.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait", // Set orientation
        unit: "mm",
        format: "a4", // Use A4 format
      });
  
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10; // Margin for the content
      let y = margin; // Start position for the content
  
      // Add company name and contact details
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24); // Larger title
      pdf.text("Genefire Pvt. Ltd.", pageWidth / 2, y, { align: "center" });
      y += 10;
  
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text("Contact: https://www.genefire.com/ | +91-XXXXXXXXXX", pageWidth / 2, y, { align: "center" });
      y += 10;
  
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y); // Add a horizontal line
      y += 6;
  
      // Add title for product details
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Product Details", margin, y);
      y += 4;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y); // Add a horizontal line
      y += 5;
  
      // Helper function to add product rows with volume
      const addProductRows = (title, products, agentReq, volume) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text(`${title} (${agentReq}g Agent Mass Required):`, margin, y);
        y += 10;
  
        // Add volume
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(12);
        pdf.text(`Volume: ${volume.toFixed(2)} m³`, margin, y);
        y += 10;
  
        if (Object.entries(products).length > 0) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(12);
  
          Object.entries(products).forEach(([code, qty]) => {
            const detail = productDetails[code];
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.5);
            pdf.rect(margin, y - 5, pageWidth - margin * 2, 10); // Highlight border
            pdf.text(
              `Code: ${code}, Qty: ${qty}, AGC Mass: ${detail?.agcMass || "N/A"}`,
              margin + 2,
              y
            );
            y += 15;
          });
        } else {
          pdf.text("No products available.", margin, y);
          y += 15;
        }
      };
  
      // Add Room Products
      const roomVolume = inputs.length * inputs.breadth * inputs.height;
      addProductRows("Room Products", roomTotalAgent, roomagentreq, roomVolume);
  
      // Add Trench Products
      const trenchVolume = inputs.trenchLength * inputs.trenchWidth * inputs.trenchHeight;
      addProductRows("Trench Products", trenchTotalAgent, trenchagentreq, trenchVolume);
  
      // Add Ceiling Products
      const ceilingVolume = inputs.length * inputs.breadth * inputs.ceilingHeight;
      addProductRows("Ceiling Products", ceilingTotalAgent, ceilingagentreq, ceilingVolume);
  
      // Add footer
      y += 10;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.text("Generated by Genefire Aerosol Suppression Calculator", pageWidth / 2, y, { align: "center" });
  
      // Save the PDF
      pdf.save("Product_Details.pdf");
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Remove product from a specific section
  const handleRemoveProduct = (section, code) => {
    if (section === "room") {
      setRoomTotalAgent((prev) => {
        const updated = { ...prev };
        delete updated[code];
        return updated;
      });
    } else if (section === "trench") {
      setTrenchTotalAgent((prev) => {
        const updated = { ...prev };
        delete updated[code];
        return updated;
      });
    } else if (section === "ceiling") {
      setCeilingTotalAgent((prev) => {
        const updated = { ...prev };
        delete updated[code];
        return updated;
      });
    }
  };

  // Update product quantity in a specific section
  const handleUpdateQuantity = (section, code, newQty) => {
    if (newQty <= 0) return handleRemoveProduct(section, code);

    if (section === "room") {
      setRoomTotalAgent((prev) => ({ ...prev, [code]: newQty }));
    } else if (section === "trench") {
      setTrenchTotalAgent((prev) => ({ ...prev, [code]: newQty }));
    } else if (section === "ceiling") {
      setCeilingTotalAgent((prev) => ({ ...prev, [code]: newQty }));
    }
  };

  // The rest of your component code remains the same...

  // Input validation
  const validateInputs = () => {
    return inputs.length > 0 && 
           inputs.breadth > 0 && 
           inputs.height > 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Aerosol Suppression Calculator</h1>

        {/* Area Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📐 Area Section</h2>
          <div className={styles.grid}>
            <label className={styles.label}>
              Length (m)
              <input 
                type="number" 
                name="length" 

                value={inputs.length} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
            <label className={styles.label}>
              Breadth (m)
              <input 
                type="number" 
                name="breadth" 
    
                value={inputs.breadth} 
                className={styles.input} 
                onChange={handleChange} 
              />
              
            </label>
          </div>
        </div>

        {/* Volume Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📦Room Volume Section</h2>
          <div className={styles.grid}>
            <label className={styles.label}>
              Height (m)
              <input 
                type="number" 
                name="height" 
                min="0.1"
                step="0.1"
                value={inputs.height} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
          </div>
        </div>

        {/* Ceiling Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🧱 Ceiling Section</h2>
          <div className={styles.grid}>
            <label className={styles.label}>
              Ceiling Height (m)
              <input 
                type="number" 
                name="ceilingHeight" 
                min="0"
                step="0.1"
                value={inputs.ceilingHeight} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
          </div>
        </div>

        {/* Trench Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🕳️ Trench Section</h2>
          <div className={styles.grid}>
            <label className={styles.label}>
              Trench Length (m)
              <input 
                type="number" 
                name="trenchLength" 
                value={inputs.trenchLength} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
            <label className={styles.label}>
              Trench Width (m)
              <input 
                type="number" 
                name="trenchWidth" 
                min="0"
                step="0.1"
                value={inputs.trenchWidth} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
            <label className={styles.label}>
              Trench Height (m)
              <input 
                type="number" 
                name="trenchHeight" 
                min="0"
                step="0.1"
                value={inputs.trenchHeight} 
                className={styles.input} 
                onChange={handleChange} 
              />
            </label>
          </div>
        </div>

        {/* Default Parameters */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⚙️ Default Parameters</h2>
          <div className={styles.grid}>
            <label className={styles.label}>
              EAD (g/m³)
              <input 
                type="number" 
                name="ead" 
                min="1"
                step="1"
                value={inputs.ead} 
                className={styles.input} 
                onChange={handleChange} 
             />
            </label>
            <label className={styles.label}>
              Safety Factor
              <input 
                type="number" 
                name="safetyFactor" 
                min="1"
                step="0.1"
                value={inputs.safetyFactor} 
                className={styles.input} 
                onChange={handleChange} 
               />
            </label>
            <label className={styles.label}>
              Design Factor (fa)
              <input 
                type="number" 
                name="fa" 
                min="0.1"
                step="0.1"
                value={inputs.fa} 
                className={styles.input} 
                onChange={handleChange} 
               />
            </label>
          </div>
        </div>

        {/* Fire Class & Installation */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔥 Fire Class & Installation</h2>
          <div className={styles.grid}>
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
              </select>
            </label>
            <label className={styles.label}>
              Installation
              <select 
                name="installation" 
                className={styles.input} 
                value={inputs.installation} 
                onChange={handleChange}
              >
                <option value="Room">Room</option>
                <option value="Panel">Panel</option>
                <option value="Container">Container</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonWrapper}>
          <button 
            className={styles.button} 
            onClick={handleCalculate}
            disabled={!validateInputs() || isCalculating}
          >
            {isCalculating ? "Calculating..." : "Show Result 🔍"}
          </button>
          {showResults && (
            <button 
              className={styles.button} 
              onClick={handleExportPDF}
            >
              Export PDF 📄
            </button>
          )}
        </div>

        {/* Results Section */}
        {showResults && result && (
          <div className={styles.result} ref={resultRef}>
            <h2 className={styles.resultTitle}>📊 Calculation Results</h2>
            <div className={styles.resultGrid}>
            <div className={styles.resultItem}>   
                <span className={styles.resultLabel}>Room Area :  </span>
                <span className={styles.resultValue}>{result.roomarea.toFixed(2)} m³</span>
  
              </div>

              <div className={styles.resultItem}>   
                <span className={styles.resultLabel}>Room Volume : </span>
                <span className={styles.resultValue}>{result.roomVolume.toFixed(2)} m³</span>
              </div>
              <div className={styles.resultItem}>   
                <span className={styles.resultLabel}>Trench  Volume : </span>
                <span className={styles.resultValue}>{result.safeTrench.toFixed(2)} m³</span>
              </div>
              <div className={styles.resultItem}>   
                <span className={styles.resultLabel}>Ceiling Volume : </span>
                <span className={styles.resultValue}>{result.safeCeiling.toFixed(2)} m³</span>
              </div>
 
              <h4>************* Final**************</h4>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Total Volume : </span>
                <span className={styles.resultValue}>{result.totalVolume.toFixed(2)} m³</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Design Application Density : </span>
                <span className={styles.resultValue}>{result.da.toFixed(2)} g/m³</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Total Agent Required : </span>
                <span className={styles.resultValue}>{result.totalAgent.toFixed(2)} g</span>
              </div>
            </div>

            {/* Recommended Products */}
           <h3 className={styles.resultTitle}>🔥 Recommended Products</h3>

            {/* Room Total Agent Products */}
            <h4 className={styles.resultTitle}>Room Products : {roomagentreq}g Agent mass Required</h4>
            <div className={styles.productGrid}>
              {Object.entries(roomTotalAgent).length > 0 ? (
                Object.entries(roomTotalAgent).map(([code, qty]) => {
                  const detail = productDetails[code];
                  return (
                    <div key={code} className={styles.productCard}>
                      <img
                        src={`/products/${code}.png`}
                        alt={code}
                        className={styles.productImage}
                        onError={(e) => (e.target.src = "/products/placeholder.png")}
                      />
                      <div className={styles.productDetails}>
                        <div className={styles.productHeader}>
                          <div className={styles.productCode}>{code}</div>
                          <div className={styles.productQty}>
                            <label>Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) =>
                                handleUpdateQuantity("room", code, parseInt(e.target.value))
                              }
                              className={styles.qtyInput}
                            />
                          </div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveProduct("room", code)}
                          >
                            Remove ❌
                          </button>
                        </div>
                        {detail && (
                          <div className={styles.techSpecs}>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>AGC Mass:</span>
                              <span>{detail.agcMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Total Weight:</span>
                              <span>{detail.totalMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Protected Volume:</span>
                              <span>{detail.volume}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Discharge Time:</span>
                              <span>{detail.time}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Size:</span>
                              <span>{detail.size}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Fire Class:</span>
                              <span>{detail.class}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Installation:</span>
                              <span>{detail.installation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No products available for Room Total Agent.</p>
              )}
            </div>

            {/* Trench Total Agent Products */}
            <h4 className={styles.resultTitle}>Trench Products : {trenchagentreq}g Agent mass Required</h4>
            <div className={styles.productGrid}>
              {Object.entries(trenchTotalAgent).length > 0 ? (
                Object.entries(trenchTotalAgent).map(([code, qty]) => {
                  const detail = productDetails[code];
                  return (
                    <div key={code} className={styles.productCard}>
                      <img
                        src={`/products/${code}.png`}
                        alt={code}
                        className={styles.productImage}
                        onError={(e) => (e.target.src = "/products/placeholder.png")}
                      />
                      <div className={styles.productDetails}>
                        <div className={styles.productHeader}>
                          <div className={styles.productCode}>{code}</div>
                          <div className={styles.productQty}>
                            <label>Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) =>
                                handleUpdateQuantity("trench", code, parseInt(e.target.value))
                              }
                              className={styles.qtyInput}
                            />
                          </div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveProduct("trench", code)}
                          >
                            Remove ❌
                          </button>
                        </div>
                        {detail && (
                          <div className={styles.techSpecs}>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>AGC Mass:</span>
                              <span>{detail.agcMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Total Weight:</span>
                              <span>{detail.totalMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Protected Volume:</span>
                              <span>{detail.volume}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Discharge Time:</span>
                              <span>{detail.time}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Size:</span>
                              <span>{detail.size}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Fire Class:</span>
                              <span>{detail.class}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Installation:</span>
                              <span>{detail.installation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No products available for Trench Total Agent.</p>
              )}
            </div>

            {/* Ceiling Total Agent Products */}
            <h4 className={styles.resultTitle}>Ceiling Products : {ceilingagentreq}g Agent mass Required</h4>
            <div className={styles.productGrid}>
              {Object.entries(ceilingTotalAgent).length > 0 ? (
                Object.entries(ceilingTotalAgent).map(([code, qty]) => {
                  const detail = productDetails[code];
                  return (
                    <div key={code} className={styles.productCard}>
                      <img
                        src={`/products/${code}.png`}
                        alt={code}
                        className={styles.productImage}
                        onError={(e) => (e.target.src = "/products/placeholder.png")}
                      />
                      <div className={styles.productDetails}>
                        <div className={styles.productHeader}>
                          <div className={styles.productCode}>{code}</div>
                          <div className={styles.productQty}>
                            <label>Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) =>
                                handleUpdateQuantity("ceiling", code, parseInt(e.target.value))
                              }
                              className={styles.qtyInput}
                            />
                          </div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveProduct("ceiling", code)}
                          >
                            Remove ❌
                          </button>
                        </div>
                        {detail && (
                          <div className={styles.techSpecs}>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>AGC Mass:</span>
                              <span>{detail.agcMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Total Weight:</span>
                              <span>{detail.totalMass}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Protected Volume:</span>
                              <span>{detail.volume}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Discharge Time:</span>
                              <span>{detail.time}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Size:</span>
                              <span>{detail.size}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Fire Class:</span>
                              <span>{detail.class}</span>
                            </div>
                            <div className={styles.specItem}>
                              <span className={styles.specLabel}>Installation:</span>
                              <span>{detail.installation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No products available for Ceiling Total Agent.</p>
              )}
            </div>

            {/* Add Product Manually */}
            <div className={styles.addProductBox}>
              <h4>Add Product Manually ➕</h4>
              <div className={styles.addForm}>
                {/* Dropdown for selecting section */}
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={styles.input}
                >
                  <option value="">-- Select Section --</option>
                  <option value="room">Room</option>
                  <option value="trench">Trench</option>
                  <option value="ceiling">Ceiling</option>
                </select>


                {/* Dropdown for selecting product */}
                <select
                  value={newProductCode}
                  onChange={(e) => setNewProductCode(e.target.value)}
                  className={styles.input}
                >
                  <option value="">-- Select Product --</option>
                  {Object.keys(productDetails).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>

                {/* Input for product quantity */}
                <input
                  type="number"
                  min="1"
                  value={newProductQty}
                  onChange={(e) => setNewProductQty(parseInt(e.target.value))}
                  className={styles.input}
                />

                {/* Button to add product */}
                <button
                  className={styles.button}
                  onClick={handleAddProduct}
                  disabled={!newProductCode || !selectedSection}
                >
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