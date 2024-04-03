document.addEventListener('DOMContentLoaded', function() {
    var cartElement = document.getElementById('cartData');
    var cartData = cartElement.getAttribute('data-cart');
    console.log("THE TYPE OF CART DATA IS", typeof cartData);
    if (cartData) {
        console.log("FINAL CART UPDATED", cartData);
        if (typeof cartData !== 'string')
           cartData = JSON.stringify(cartData) 
        localStorage.setItem('cart', cartData);
    }
});
