import React, { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import { fetch_items } from "./Functions";

const UploadItemDetailsCSV = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
    };

    const processCSVFile = async () => {
        if (!file) {
            setUploadStatus("Please upload a valid CSV file.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data;
                const currentDate = new Date().toISOString().split("T")[0]; // Today's date

                try {
                    let items = await fetch_items(); // Fetch all items from the API

                    // Check if the fetched items are in the expected format
                    if (items.items && Array.isArray(items.items)) {
                        items = items.items; // Access the array inside 'items'
                    } else {
                        throw new Error("Fetched items are not in the expected format.");
                    }

                    const formattedData = data.map((row) => {
                        const modelName = row["Model Name"];
                        if (!modelName) {
                            throw new Error("Missing 'Model Name' in CSV row.");
                        }

                        const matchingItem = items.find(
                            (item) => item.modelNumber === modelName
                        );

                        if (!matchingItem) {
                            throw new Error(`Model Name '${modelName}' not found in items.`);
                        }

                        return {
                            imei1: row["IMEI1"],
                            imei2: row["IMEI2"],
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
            },
            error: (error) => {
                setUploadStatus("Error reading file: " + error.message);
            },
        });
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Upload Item Details (CSV)</h1>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <button onClick={processCSVFile} style={{ marginLeft: "10px" }}>
                Upload and Process
            </button>
            {uploadStatus && <p style={{ marginTop: "20px" }}>{uploadStatus}</p>}
        </div>
    );
};

export default UploadItemDetailsCSV;
