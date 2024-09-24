// controllers/cart.js
const axios = require('axios');
const Card = require('../models/products');  // Assuming Card represents your products collection

const AUTH_ID = 'd6a9a83a-8cec-0efa-a575-fc718a67dc74';
const AUTH_TOKEN = 'M6Me2e765MsZki1cllyE';

// Renders the shopping cart page
async function showCart(req, res) {
  let cart = req.session.cart || [];
  let total = 0;

  // Calculate total price for the cart
  for (const item of cart) {
      total += item.price * item.quantity;
  }

  res.render("cart", { cart, total }); // Pass cart and total price to the view
}


// Validates the address using SmartyStreets International API
async function validateAddress(req, res) {
  const { street, locality, postal_code, country = "ISR" } = req.body;

  // API URL for international address validation
  const url = `https://international-street.api.smartystreets.com/verify?auth-id=${AUTH_ID}&auth-token=${AUTH_TOKEN}&address1=${encodeURIComponent(street)}&locality=${encodeURIComponent(locality)}&postal_code=${encodeURIComponent(postal_code)}&country=${encodeURIComponent(country)}`;

  try {
      console.log('Sending GET request to SmartyStreets:', url);  // Log the full URL

      const response = await axios.get(url);
      const data = response.data;
      
      console.log('SmartyStreets API response status:', response.status);  // Log the response status
      console.log('SmartyStreets API response data:', data);  // Log the API response data

      if (response.status === 200 && data.length > 0) {
          const addressAnalysis = data[0].analysis;
          console.log('data[0].analysis=', data[0].analysis, 'legnth:', data.length)
          console.log('addressAnalysis.verification_status-', addressAnalysis.verification_status)
          // Check the verification status
          switch (addressAnalysis.verification_status) {
              case 'Verified':
              case 'Partial':
                  return res.json({ valid: true, message: 'Address is valid!', address: data[0] });
              case 'Ambiguous':
                  return res.json({ valid: false, message: 'Multiple addresses found. Please provide more precise information.' });
              case 'None':
              default:
                  return res.json({ valid: false, message: 'Address could not be validated. Please reenter shipping address' });
          }
      } else {
          return res.json({ valid: false, message: 'Address not found or invalid.' });
      }
  } catch (error) {
      console.error('Error during address validation:', error);  // Log any unexpected errors
      res.status(500).json({ valid: false, message: 'Server error while validating the address. Please try again later.', error });
  }
}

module.exports = {
  showCart,
  validateAddress
};