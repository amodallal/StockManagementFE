import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

 //Get Employees

 
 //Get Items

 export const fetch_items = async () => {
  try {
    const [itemsRes] = await Promise.all([
      axios.get('http://localhost:5257/api/items'),
    ]);
    return {
      items: itemsRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Post Items
export const PostItem = async (item) => {
  try {
    await axios.post('http://localhost:5257/api/items', item);
    //alert('Items submitted successfully!');
  } catch (error) {
    console.error('Error submitting items:', error);
    alert('Failed to submit items.');
  }
};

//Delete Item

export const DeleteItem = async (itemId) => {
  try
  {
    await axios.delete(`http://localhost:5257/api/items/${itemId}`);
    alert('Item deleted successfully!');
  } catch (error) {
    alert('Failed to delete item.');
  }
};

 //Get Suppliers


 //Get Descriptions

 
 //Get Brands
 
 export const fetch_brands = async () => {
  try {
    const [brandsRes] = await Promise.all([
      axios.get('http://localhost:5257/api/brands'),
    ]);
    return {
      brands: brandsRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

  


 //Get Categories
 export const fetch_categories = async () => {
  try {
    const [categoriesRes] = await Promise.all([
      axios.get('http://localhost:5257/api/categories'),
    ]);
    return {
      categories: categoriesRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

 //Get Capacities

 export const fetch_capacities = async () => {
  try {
    const [capacitiesRes] = await Promise.all([
      axios.get('http://localhost:5257/api/capacities'),
    ]);
    return {
      capacities: capacitiesRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Post Capacity
export const PostCapacity = async (Capacity) => {
  try {
    await axios.post('http://localhost:5257/api/Capacities', Capacity);
    alert('Capacity submitted successfully!');
  } catch (error) {
    console.error('Error submitting Capacity:', error);
    alert('Failed to submit Capacity.');
  }
};

// Delete Capacity
export const DeleteCapacity = async (capacityID) => {
  try {
    await axios.delete(`http://localhost:5257/api/capacities/${capacityID}`);
    alert('Capacity deleted successfully!');
    return true;
    
  } catch (error) {
    alert('Failed to delete capacity.');
    return false;
   
    
  }
};

//Get ItemsCpacites

export const fetch_itemscapacities = async () => {
  try {
    const [itemscapacitiesRes]  = await axios.get(`http://localhost:5257/api/items/item-capacities`);
    return {
      itemscapacities: itemscapacitiesRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};


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



