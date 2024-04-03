// intercept login form with event listener on submit
// modify the body by adding the local storage cart to it

// send the data to the server with fetch api

// receive the server response with the most up ot date cart and
// store it back in local storage and then redirect user to home page.

document.getElementById('login_form').addEventListener('submit', function(event) {
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cartData').value = JSON.stringify(cartData);
});