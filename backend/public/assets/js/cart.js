function addItemToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCart() {
    console.log("THE CART in getCart()", localStorage.getItem('cart'));
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateStorage(title) {

}

function updateCart(cart){
    // any time we update we want to save to database if authenticated.
    const cartArray = Array.isArray(cart) ? cart : [];
    const stringifiedCart = JSON.stringify(cartArray);
    const isLoggedIn = document.cookie.split('; ').some(cookie => cookie.startsWith('isLoggedIn=true'));
    console.log("IS AUTH?", isLoggedIn, document.cookie)
    if (isLoggedIn) {
        console.log("THAT WAS TRUE")
        // post the changed cart to backend
        fetch('/auth/cart', {  // Use the appropriate endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include other headers as needed, e.g., for CSRF protection
        },
        body: stringifiedCart,  // Send the updated cart as the request body
        credentials: 'include'  // This is important for including cookies in the request, which might be needed for authentication
        })
        .then(response => {
            if (response.ok) {
                console.log("OKAY RESPONSE!")
                return response.json();  // Or handle the response in another appropriate way
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Cart updated successfully:', data);
        })
        .catch(error => {
            console.error('Error updating cart:', error);
        });
    }
}

// if the user is logged in then first fetch the most updated cart
// from the backend.

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
    }
  })
  .catch(error => {
    console.error("Error fetching cart data:", error);
  });
});

const books = getCart();
console.log("YOUR CART", books)
let totalCost = 0;
const totalDiv = document.createElement('div');
const container = document.querySelector('.cart-container')

books.forEach(row => {
    const element = document.createElement('div');
    totalCost += (parseFloat(row.price) * row.quantity);
    console.log(typeof row.price, typeof row.quantity, totalCost)
    element.innerHTML =
    `        <div class="cart-entry">
                <div class="first-col">
                    <img src="${row.thumbnail}" alt="Book Thumbnail" class="cart-img">
                </div>

                <div class="second-col">
                    <h2 class="cart-title text-danger" title="${row.title}"><b class="book-title">${row.title}</b></h2>
                    <p>by ${row.author}</p>
                </div>

                <div class="third-col">
                    <p><b>Unit Price:</b> <span class="unit-price">${row.price}</span></p>
                    <p><b>Published:</b> ${row.pubyear}</p>
                    <p><b>ISBN:</b><span class="book-isbn">${row.isbn}</span></p>
                </div>
                
                <div class="fourth-col">
                <form class="form-group">
                    <div class="item">
                        <button class="decrement-btn">-</button>
                        <input type="number" id="quantity1" class="quantity" value=${row.quantity} min=0>
                        <button class="increment-btn">+</button>
                        <div>
                            <button class="remove-from-cart-btn">Remove from cart</button>
                        </div>
                    </div>

                </form>
                </div>

                <div class="fifth-col">
                    <h3 class="text-primary item-total">$${(row.price * row.quantity).toFixed(2)}</h3>
                </div>
             
              
              
            </div>`

        container.appendChild(element); 

        const incrementButton = element.querySelector('.increment-btn');
        incrementButton.addEventListener('click', function(event) {
            event.preventDefault();
            const itemContainer = incrementButton.closest('.item');
            const quantityInput = itemContainer.querySelector('.quantity');
            quantityInput.value = parseInt(quantityInput.value, 10) + 1;
            // update the total element by the cost of one item 

            const cartEntry = incrementButton.closest('.cart-entry');
            // update the total for the current item
            const totalItemPrice = cartEntry.querySelector('.item-total');
            const title = cartEntry.querySelector('.book-title').innerText; 
            const price = parseFloat(parseFloat(cartEntry.querySelector('.unit-price').innerText).toFixed(2)); 
            totalItemPrice.innerText = (price * parseInt(quantityInput.value)).toFixed(2); 
            totalCost += price;

            const totalCostElement = document.querySelector('.total-cost');
            totalCostElement.innerText = totalCost.toFixed(2);
            // update the local store (& potentially update the user's cart in the database)
            // can easily just have a cart table with the user id and isbn as foreign key, and quantity as another row. 
            // user id + isbn can be composite key since their combination is unique.

            // or we can just store the json with the user id as a column and the cart column as the json string.
            
            // so given the title element, we can access the correct element and update the quantity.
            const cart = getCart();
            for (let key in cart) {
                if (cart[key].title === title) {
                    cart[key].quantity += 1;
                    console.log('a', cart[key])
                }
            }
            const stringifiedCart = JSON.stringify(cart);
// -----------------------------------------------------------------------------------------------------------------------------
            localStorage.setItem('cart', stringifiedCart);
            updateCart(cart);
    });

        const decrementButton = element.querySelector('.decrement-btn');
        decrementButton.addEventListener('click', function(event) {
            event.preventDefault();
            const itemContainer = this.closest('.item');
            const quantityInput = itemContainer.querySelector('.quantity');
            const currentValue = parseInt(quantityInput.value, 10);

            // update the total element by the cost of one item 
            const cartEntry = decrementButton.closest('.cart-entry');
            // update the total for the current item
            const totalItemPrice = cartEntry.querySelector('.item-total');
            const title = cartEntry.querySelector('.book-title').innerText; 
            const price = parseFloat(parseFloat(cartEntry.querySelector('.unit-price').innerText).toFixed(2)); 

            // if 1 then we cant go any lower abd must delete
            if (currentValue === 1){
                // remove it from object
                const cart = getCart();
                const itemIndex = cart.findIndex(item => item.title === title);
                if (itemIndex !== -1) {
                    cart.splice(itemIndex, 1);
            } 
// -----------------------------------------------------------------------------------------------------------------------------
                const stringifiedCart = JSON.stringify(cart);
                localStorage.setItem('cart', stringifiedCart);
                updateCart(cart);
                console.log("SPLICED")
                cartEntry.remove();
                // add a number to the cart based on the length of the cart object.
                const cartLink = document.querySelector('.cart-link');
                cartLink.innerHTML = "cart (" + cart.length + ")";
                return;
            }

            // updating quality 
            quantityInput.value = currentValue - 1;
            console.log("Substracted 1", quantityInput.value);

            totalItemPrice.innerText = (price * parseInt(quantityInput.value)).toFixed(2); 
            totalCost -= price;

            const totalCostElement = document.querySelector('.total-cost');
            totalCostElement.innerText = totalCost.toFixed(2);
            // update the local store (& potentially update the user's cart in the database)
            // can easily just have a cart table with the user id and isbn as foreign key, and quantity as another row. 
            // user id + isbn can be composite key since their combination is unique.

            // or we can just store the json with the user id as a column and the cart column as the json string.
            
            // so given the title element, we can access the correct element and update the quantity.
            const cart = getCart();
            // for (let key in cart) {
            //     if (cart[key].title === title) {
            //         cart[key].quantity -= 1;
            //         console.log('a', cart[key])
            //     }
            // }
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].title === title) {
                cart[i].quantity -= 1;
                console.log('Updated item:', cart[i]);

                // Remove the item if its quantity is zero
                if (cart[i].quantity <= 0) {
                    cart.splice(i, 1);
                    const cartEntry = decrementButton.closest('.cart-entry');
                    // remove from cart
                    cartEntry.remove();
                }

                break;
                }
            }

// -----------------------------------------------------------------------------------------------------------------------------
            const stringifiedCart = JSON.stringify(cart);
            localStorage.setItem('cart', stringifiedCart);
            updateCart(cart);
        });

        const removeFromCartButton = element.querySelector('.remove-from-cart-btn');
        removeFromCartButton.addEventListener('click', function(event) {
            event.preventDefault();
            const cartEntry = removeFromCartButton.closest('.cart-entry');
            // remove from cart
            cartEntry.remove();
            // remove from local storage
            const title = cartEntry.querySelector('.book-title').innerText; 
            const isbn = cartEntry.querySelector('.book-isbn').innerText; 
            const cart = getCart();
            const newCart = cart.filter(item => item.isbn !== isbn);
            console.log("THE NEW CART IS", newCart);
            const stringifiedCart = JSON.stringify(newCart);
            console.log("THE NEW STRINGIFIED CART IS", stringifiedCart);
            localStorage.setItem('cart', stringifiedCart);
            updateCart(newCart);
            // add a number to the cart based on the length of the cart object.
            cartLink.innerHTML = "cart (" + newCart.length + ")";
        });
})

const totalElement =     `<div class="cart-entry">
                <div class="first-col">
                </div>

                <div class="second-col">
                </div>

                <div class="third-col">
                </div>
                
                <div class="fourth-col">
                Total:
                </div>

                <div class="fifth-col">
                    <h3 class="text-primary total-cost">$${totalCost.toFixed(2)}</h3>
                </div>
            </div>`
    totalDiv.innerHTML = totalElement;

    container.appendChild(totalDiv); 



// add a number to the cart based on the length of the cart object.
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartLink = document.querySelector('.cart-link');
cartLink.innerHTML = "cart (" + cart.length + ")";


// document.getElementById('checkout-btn').addEventListener('click', async () => {
//     console.log("Clicked")
//     // Get the cart data from local storage
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];

//     // Check if the cart is not empty
//     if (cart.length === 0) {
//         alert('Your cart is empty.');
//         return;
//     }

//     // Create the payload to send to the server
//     const payload = {
//         items: cart
//     };

//     try {
//         console.log("Fetch")
//         const response = await fetch('/pay', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const result = await response.json();
//         window.location.href = result.redirectUrl;
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });


document.getElementById('paymentForm').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get cart data from local storage
    const cart = localStorage.getItem('cart') || JSON.stringify([]);

    // Set the hidden input field with cart data
    document.getElementById('cartData').value = cart;
    console.log("cart", cart, typeof cart);
    // Submit the form manually
    this.submit();
});