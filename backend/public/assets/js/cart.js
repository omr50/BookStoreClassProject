function addItemToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateStorage(title) {

}


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
                    <p><b>ISBN:</b>${row.isbn}</p>
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
            localStorage.setItem('cart', JSON.stringify(cart));
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

                localStorage.setItem('cart', JSON.stringify(cart));
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
            for (let key in cart) {
                if (cart[key].title === title) {
                    cart[key].quantity -= 1;
                    console.log('a', cart[key])
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
        });

        const removeFromCartButton = element.querySelector('.remove-from-cart-btn');
        removeFromCartButton.addEventListener('click', function(event) {
            event.preventDefault();
            const cartEntry = removeFromCartButton.closest('.cart-entry');
            // remove from cart
            cartEntry.remove();
            // remove from local storage
            const title = cartEntry.querySelector('.book-title').innerText; 
            const cart = getCart();
            const newCart = cart.filter(item => item.title !== title);
            localStorage.setItem('cart', JSON.stringify(newCart));
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
                    <h3 class="text-primary total-cost">$${totalCost}</h3>
                </div>
            </div>`
    totalDiv.innerHTML = totalElement;

    container.appendChild(totalDiv); 




