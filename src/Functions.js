import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';


 // Get items , suppliers , and description data
export const fetch_itm_sup_des = async () => {
    try {
      const [itemsRes, suppliersRes, descriptionsRes] = await Promise.all([
        axios.get('http://localhost:5257/api/items'),
        axios.get('http://localhost:5257/api/supplier'),
        axios.get('http://localhost:5257/api/description'),
      ]);
      return {
        items: itemsRes.data,
        suppliers: suppliersRes.data,
        descriptions: descriptionsRes.data,
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };
  
  //Play Buzzer at error
  export const playBuzzer = () => {
    const audio = new Audio('/buzzer.wav');  // Make sure the sound file is in the public folder
    audio.play();  // Play the buzzer sound
  };

  //Check if IMEI exists in the database
 export const checkIMEIExists = async (imei1) => {
  try {
    const response = await axios.get(`http://localhost:5257/api/Itemdetails/CheckIMEI/${imei1}`);
  
  // Check the response for the 'exists' property
    if (response.data.exists === true) {
      return true; // IMEI exists
    } else {
      return false; // IMEI does not exist
    }
     // If response contains data, IMEI exists
  } catch (error) {
    console.error('Error checking IMEI:', error);
    return false;
  }
};

  // Read Excel file 
  /**
 * Function to read and parse an Excel file.
 * @param {File} file - The Excel file to process.
 * @returns {Promise<Array>} - A promise that resolves to an array of parsed data.
 */
export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData); // Resolve the parsed data
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsArrayBuffer(file);
  });
};