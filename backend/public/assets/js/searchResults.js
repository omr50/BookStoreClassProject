function addItemToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
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
