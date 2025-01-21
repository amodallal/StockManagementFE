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

    const processCSVFile = () => {
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
                    const items = await fetch_items(); // Fetch all items from the API

                    const formattedData = data.map((row) => {
                        const matchingItem = items.find((item) => item.modelNumber == row["Model Number"]);
                        if (!matchingItem) {
                            throw new Error(`Model Number ${row["Model Number"]} not found in items`);
                        }

                        return {
                            IMEI1: row["IMEI1"],
                            DateReceived: currentDate,
                            itemId: matchingItem.item_id,
                        };
                    });

                    // Send each record to the API
                    for (let item of formattedData) {
                        await axios.post("http://localhost:5257/api/ItemDetails", item);
                    }
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
