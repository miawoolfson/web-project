// public/js/cart.js
document.addEventListener('DOMContentLoaded', () => {
    updateCartTotal();

    // Add event listeners for the plus and remove buttons
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', handleRemoveFromCart);
    });
});


// Function to show the popup and refresh the page after a delay
function showItemAddedPopup(message) {
    const popup = document.getElementById('item-added-popup');
    const popupText = document.getElementById('popup-text');

    popupText.innerText = message; 
    popup.style.display = 'block'; 

    // Hide the popup after 2 seconds and refresh the page
    setTimeout(() => {
        popup.style.display = 'none'; 
        location.reload(); 
    }, 1000); 
}


// Function to handle adding an item to the cart (increment)
async function handleAddToCart(event) {
    const button = event.target;
    const cardId = button.closest('tr').dataset.cardid;  // Get card ID from the row

    try {
        const response = await axios.post('/cart/add', { cardId: parseInt(cardId) });
        const result = response.data;
        
       console.log('Adding result', result)
        
        // Check if the message indicates success
        if (result.message === "Card added to cart") {
            showItemAddedPopup('Quantity updated in your cart!');
        } else {
            alert(result.message);  // Show any other messages (e.g., errors)
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Error adding item to cart');
    }
}

// Function to handle removing an item from the cart
async function handleRemoveFromCart(event) {
    const button = event.target;
    const cardId = button.closest('tr').dataset.cardid;

    try {
        const response = await axios.post('/cart/remove', { cardId: parseInt(cardId) });
        const result = response.data;

        console.log("Remove result", result); // Debugging to see the full result

        // Check if the message indicates success
        if (result.success) {
            showItemAddedPopup('Item quantity updated in your cart!'); // Show popup message
            setTimeout(() => {
                location.reload(); // Reload the page after a short delay to show updated quantity
            }, 1000); // Delay before reloading
        } else {
            alert(result.message);  // Show any other messages (e.g., errors)
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        alert('Error removing item from cart');
    }
}



// Function to update cart total
function updateCartTotal() {
    let total = 0;
    const cartItems = document.getElementsByClassName('cart-item');

    for (let i = 0; i < cartItems.length; i++) {
        const priceElement = cartItems[i].getElementsByClassName('cart-price')[0];
        const price = parseFloat(priceElement.innerText.replace('$', ''));
        const quantity = parseInt(cartItems[i].getElementsByClassName('quantity')[0].innerText);
        total += price * quantity;
    }

    total = Math.round(total * 100) / 100;
    document.getElementById('items-total').innerText = total.toFixed(2);
}


// Address validation submission for regular orders (Place Order button)
document.getElementById('address-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    const street = document.getElementById('street').value.trim();
    const locality = document.getElementById('locality').value.trim();
    const postal_code = document.getElementById('postal_code').value.trim();

    const messageElement = document.getElementById('validation-message');
    messageElement.textContent = ''; // Clear previous messages

    if (!street || !locality || !postal_code) {
        messageElement.textContent = 'Please fill in all the required fields.';
        messageElement.style.color = 'red';
        return;
    }

    try {
        console.log("Sending request to validate address...");
        const response = await axios.post('/cart/validate-address', {
            street,
            locality,
            postal_code,
            country: 'ISR'
        });

        const result = response.data;
        console.log("Result after address validation:", result);

        if (!result.valid) {
            messageElement.textContent = result.message;
            messageElement.style.color = 'red';
        } else {
            showOrderPlacedMessage(result.order.orderId);
        }
    } catch (error) {
        console.error("Error validating address:", error);
        messageElement.textContent = 'Error occurred while validating the address. Please try again later.';
        messageElement.style.color = 'red';
    }
});

// Pickup Order Button - Show store locations when the "Pickup Order" button is clicked
document.getElementById('pickup-order-btn').addEventListener('click', (event) => {
    event.preventDefault();  // Prevent form submission

    const storeLocations = document.getElementById('store-locations');
    storeLocations.style.display = 'block';  // Show store locations dropdown
});

// Handle the confirmation of the store pickup without address validation
document.getElementById('confirm-pickup-btn').addEventListener('click', async (event) => {
    event.preventDefault();  // Prevent form submission

    const storeAddress = document.getElementById('store-select').value;
    const messageElement = document.getElementById('validation-message');
    messageElement.textContent = ''; // Clear previous messages

    try {
        const response = await axios.post('/cart/pickup-order', { storeAddress });

        const result = response.data;
        if (!result.success) {
            messageElement.textContent = result.message;
            messageElement.style.color = 'red';
        } else {
            showOrderPlacedMessage(result.order.orderId);
        }
    } catch (error) {
        console.error('Error placing pickup order:', error);
        messageElement.textContent = 'Error placing pickup order.';
        messageElement.style.color = 'red';
    }
});


// Function to show the order placed popup with order ID (for both types of orders)
function showOrderPlacedMessage(orderId) {
    const orderPlacedMessage = document.getElementById('order-placed-message');
    const orderIdElement = document.getElementById('order-id');

    // Update the message to include the order ID
    orderIdElement.innerText = `Your order ID is: ${orderId}`;
    
    orderPlacedMessage.style.display = 'flex'; // Show popup

    // Optionally, redirect to another page after a delay
    setTimeout(() => {
        orderPlacedMessage.style.display = 'none';
        window.location.href = '/profile'; // Redirect if needed
    }, 3000);
}