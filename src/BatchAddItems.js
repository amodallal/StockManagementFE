import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { fetch_items } from "./Functions";

const UploadItemDetailsXLSX = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
    };

    const processXLSXFile = async () => {
        if (!file) {
            setUploadStatus("Please upload a valid Excel file.");
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0]; // Read the first sheet
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

            const currentDate = new Date().toISOString().split("T")[0]; // Today's date

            try {
                let items = await fetch_items(); // Fetch all items from the API

                // Check if the fetched items are in the expected format
                if (items.items && Array.isArray(items.items)) {
                    items = items.items; // Access the array inside 'items'
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
                        throw new Error(`Model Name '${modelName}' not found in items.`);
                    }
                
                    // Ensure IMEI1 and IMEI2 are strings, even if they're numbers or null
                    const imei1 = row["IMEI1"] ? row["IMEI1"].toString().trim() : ""; // Default to empty string if null or undefined
                    const imei2 = row["IMEI2"] ? row["IMEI2"].toString().trim() : ""; // Handle IMEI2 similarly
                
                    return {
                        imei1: imei1,
                        imei2: imei2,
                        serialNumber: row["Serial no"],
                        dateReceived: currentDate,
                        itemId: matchingItem.itemId, // Use correct itemId from the fetched data
                    };
                });
                
                // Send the formatted data to the batch endpoint
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
        <div style={{ padding: "20px" }}>
            <h1>Upload Item Details (Excel)</h1>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <button onClick={processXLSXFile} style={{ marginLeft: "10px" }}>
                Upload and Process
            </button>
            {uploadStatus && <p style={{ marginTop: "20px" }}>{uploadStatus}</p>}
        </div>
    );
};

export default UploadItemDetailsXLSX;
