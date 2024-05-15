document.addEventListener('DOMContentLoaded', function() {
  // Fetch cart data after the user logs in
  fetch('/auth/cart', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Include cookies for authentication
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log("Fetched cart data:", data);
    if (data.cart) {
      // Parse the cart data from string to JSON object
      var parsedCartData = JSON.parse(data.cart);
      // Store the stringified version in localStorage
      localStorage.setItem('cart', JSON.stringify(parsedCartData));
      // add a number to the cart based on the length of the cart object.
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const cartLink = document.querySelector('.cart-link');
      cartLink.innerHTML = "cart (" + cart.length + ")";
    }
  })
  .catch(error => {
    console.error("Error fetching cart data:", error);
  });
});


const cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartLink = document.querySelector('.cart-link');
cartLink.innerHTML = "cart (" + cart.length + ")";

// document.addEventListener('DOMContentLoaded', function() {
//   var cartElement = document.getElementById('cartData');
//   var cartData = cartElement.getAttribute('data-cart');
//   console.log("THE TYPE OF CART DATA IS", typeof cartData); // Should be string

//   if (cartData) {
//     console.log("FINAL CART UPDATED", cartData);
//     try {
//       // Parse the cart data from string to JSON object
//       // Store the stringified version in localStorage
//       localStorage.setItem('cart', cartData);
//     } catch (error) {
//       console.error("Error parsing cart data:", error);
//     }
//   }
// });



// document.addEventListener('DOMContentLoaded', function() {
//   // Function to get a cookie value by name
//   function getCookie(name) {
//     let cookieArr = document.cookie.split(";");

//     for(let i = 0; i < cookieArr.length; i++) {
//       let cookiePair = cookieArr[i].split("=");

//       if(name === cookiePair[0].trim()) {
//         return decodeURIComponent(cookiePair[1]);
//       }
//     }

//     return null;
//   }

//   // Retrieve the cart cookie
//   var cartData = getCookie('cart');
//   console.log("THE TYPE OF CART DATA IS", typeof cartData); // Should be string

//   if (cartData) {
//     console.log("FINAL CART UPDATED", cartData);
//     try {
//       // Parse the cart data from string to JSON object
//       var parsedCartData = JSON.parse(cartData);
//       // Store the stringified version in localStorage
//       localStorage.setItem('cart', JSON.stringify(parsedCartData));
//     } catch (error) {
//       console.error("Error parsing cart data:", error);
//     }
//   }
// });