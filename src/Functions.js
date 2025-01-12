import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

 //Get Employees

 
 //Get Items


 //Get Suppliers


 //Get Descriptions

 
 //Get Brands


 //Get Categories


 //Get Capacities


 //Get Roles


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



