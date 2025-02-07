import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { fetch_items, fetch_suppliers, fetch_supplier_item } from "./Functions";
import './styles.css'; // Importing the styles.css

const UploadItemDetailsXLSX = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [supplierItems, setSupplierItems] = useState([]);
    let quantity = 1 ;
   
    useEffect(() => {
        // Fetch suppliers
        const getSuppliers = async () => {
            try {
                const data = await fetch_suppliers();
                setSuppliers(data.suppliers);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };
        getSuppliers();
    }, []);

    // Handle supplier selection
    const handleSupplierChange = async (event) => {
        const supplierId = event.target.value;
        setSelectedSupplier(supplierId);

        if (supplierId) {
            try {
                const supplierItemData = await fetch_supplier_item();
                setSupplierItems(supplierItemData);
            } catch (error) {
                console.error("Error fetching supplier items:", error);
            }
        }
    };

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const processXLSXFile = async () => {
        if (!file) {
            setUploadStatus("Please upload a valid Excel file.");
            return;
        }
        if (!selectedSupplier) {
            setUploadStatus("Please select a supplier.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const currentDate = new Date().toISOString().split("T")[0];

            try {
                let items = await fetch_items();

                if (items.items && Array.isArray(items.items)) {
                    items = items.items;
                } else {
                    throw new Error("Fetched items are not in the expected format.");
                }
                const formattedData = sheetData.map((row) => {
                    const modelName = row["Model Name"];
                    if (!modelName) {
                        throw new Error("Missing 'Model Name' in Excel row.");
                    }

                    const matchingItem = items.find(
                        (item) => item.modelNumber === modelName
                    );

                    if (!matchingItem) {
                        console.log(modelName);
                        throw new Error(`Model Name '${modelName}' not found in items.`);
                    }

                    // Get price from supplierItems where itemId & supplierId match
                    const supplierPriceData = supplierItems.find(
                        (si) =>
                            si.itemId === matchingItem.itemId &&
                            si.supplierId == selectedSupplier
                    );
                    

                    if (!supplierPriceData) {
                        throw new Error(`No price found for '${modelName}' from the selected supplier.`);
                    }
                    //stop processing if item idetentifier is IMEI and IMEI row is empty
                    if((!row["IMEI1"]||row["IMEI1"].toString().trim()=="")&&(matchingItem.identifier=='IMEI')){
                        alert("Error: IMEI1 is empty. Processing stopped.");
                        throw new Error("Processing stopped due to empty IMEI1");
                    }
                    //stop processing if item idetentifier is SN and SN row is empty
                    if((!row["Serial no"]||row["Serial no"].toString().trim()=="")&&(matchingItem.identifier=='SN')){
                        alert("Error: Serial Number is empty. Processing stopped.");
                        throw new Error("Processing stopped due to empty Serial Number");
                    }
                     //stop processing if item idetentifier is Barcode and Barcode row is empty
                     if((!row["Barcode"]||row["Barcode"].toString().trim()=="")&&(matchingItem.identifier=='Barcode')){
                        alert("Error: Barcode is empty. Processing stopped.");
                        throw new Error("Processing stopped due to empty Barcode");
                    }
                        if ((!row["quantity"]) && (matchingItem.identifier == 'Barcode'))
                        {
                            throw new Error("Processing stopped due to empty quantity field");
                        }

                    if (matchingItem.identifier == 'Barcode')
                        {
                            quantity = row["quantity"] ? parseInt(row["quantity"], 10) || 0 : 0;
                        }

                    if ((matchingItem.identifier == 'SN') || (matchingItem.identifier == 'IMEI'))
                        {
                            quantity = 1;
                        }
                    return {
                        imei1: row["IMEI1"] ? row["IMEI1"].toString().trim() : "",
                        imei2: row["IMEI2"] ? row["IMEI2"].toString().trim() : "",
                        serialNumber: row["Serial no"] ? row["Serial no"].toString().trim() : "",
                        barcode:  row["Barcode"] ? row["Barcode"].toString().trim() : "",
                        dateReceived: currentDate,
                        itemId: matchingItem.itemId,
                        supplierId: selectedSupplier,
                        cost: supplierPriceData.costPrice,
                        salePrice: supplierPriceData.salePrice,
                        quantity: quantity,
                        
                    };
                });

                // Send data to API
                const response = await axios.post(
                    "http://localhost:5257/api/ItemDetails/batch",
                    formattedData
                );

                setUploadStatus(
                    `Data uploaded successfully! Server Response: ${response.data.message}`
                );
            } catch (error) {
                setUploadStatus("Error processing data: " + error.message);
            }
        };

        reader.onerror = (error) => {
            setUploadStatus("Error reading file: " + error.message);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="container">
            <h2 className="title">Upload File</h2>

            <div className="form">
                <div className="form-group">
                    <label htmlFor="supplier">Select Supplier:</label>
                    <select
                        id="supplier"
                        value={selectedSupplier}
                        onChange={handleSupplierChange}
                    >
                        <option value="">-- Select a Supplier --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.supplierId} value={supplier.supplierId}>
                                {supplier.supplierName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group full-width">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                    />
                </div>

                <div className="form-group full-width">
                    <button
                        className="btn btn-success submit-btn"
                        onClick={processXLSXFile}

                    >
                        Upload and Process
                    </button>
                </div>
            </div>

            {uploadStatus && <p className="status">{uploadStatus}</p>}
        </div>
    );
};

export default UploadItemDetailsXLSX;
