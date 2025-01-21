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
    
                    // Log to check the structure of the response
                    console.log("Fetched items:", items);
                    console.log("Is items an array?", Array.isArray(items));
    
                    // Check if the response has the 'items' property, which contains the array
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
                            IMEI1: row["IMEI1"],
                            DateReceived: currentDate,
                            itemId: matchingItem.itemId, // Use correct itemId from the fetched data
                        };
                    });
    
                    // Send the formatted data to the API in batches
                    await Promise.all(
                        formattedData.map((item) =>
                            axios.post("http://localhost:5257/api/ItemDetails", item)
                        )
                    );
    
                    setUploadStatus("Data uploaded successfully!");
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
