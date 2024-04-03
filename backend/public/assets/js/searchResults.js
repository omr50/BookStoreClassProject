function addItemToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCart(stringifiedCart){
    // any time we update we want to save to database if authenticated.
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

document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const item = JSON.parse(this.getAttribute('data-item'));
            const formGroup = event.target.closest('.form-group')
            item.quantity = parseInt(formGroup.querySelector('.quantity').value, 10)
            console.log("QUALITY =", item.quantity)
            addItemToCart(item);
            updateCart(JSON.stringify(getCart()));
            alert('Item added to cart!');
            console.log("ALL ITEMS IN CART", getCart());
            // add a number to the cart based on the length of the cart object.
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const cartLink = document.querySelector('.cart-link');
            cartLink.innerHTML = "cart (" + cart.length + ")";
        });
    });

    document.querySelectorAll('.increment-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const itemContainer = this.closest('.item');
            const quantityInput = itemContainer.querySelector('.quantity');
            quantityInput.value = parseInt(quantityInput.value, 10) + 1;
        });
    });

    document.querySelectorAll('.decrement-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const itemContainer = this.closest('.item');
            const quantityInput = itemContainer.querySelector('.quantity');
            const currentValue = parseInt(quantityInput.value, 10);
            quantityInput.value = currentValue > 1 ? currentValue - 1 : 1; // Prevent quantity from going below 1
        });
    });
});
