// =======================
// GLOBAL CART (localStorage)
// =======================
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let subtotal = 0;
let vat = 0;
let total = 0;

// =======================
// SAVE CART
// =======================
function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// =======================
// LOAD CART ON PAGE LOAD
// =======================
document.addEventListener("DOMContentLoaded", () => {
    updateCart();

    const chairInput = document.getElementById("clientChair");
    if (chairInput) {
        chairInput.addEventListener("keydown", e => {
            if (e.key === "Enter") e.preventDefault();
        });
    }
});

// =======================
// ADD TO CART (FROM ANY PAGE)
// =======================
function addToCart(name, price) {
    let item = cartItems.find(i => i.name === name);

    if (item) {
        item.qty++;
    } else {
        cartItems.push({ name, price, qty: 1 });
    }

    saveCart();
    updateCart();
}

// =======================
// REMOVE ITEM
// =======================
function removeFromCart(name) {
    cartItems = cartItems.filter(item => item.name !== name);
    saveCart();
    updateCart();
}

// =======================
// UPDATE CART UI
// =======================
function updateCart() {
    const cartDiv = document.getElementById("cart");
    if (!cartDiv) return; // allows cart to work on any page

    cartDiv.innerHTML = "";
    subtotal = 0;

    cartItems.forEach(item => {
        let itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        cartDiv.innerHTML += `
            <div class="cart-item">
                <span>${item.name} x ${item.qty}</span>
                <span>$${itemTotal.toFixed(2)}</span>
                <button onclick="removeFromCart('${item.name}')">✖</button>
            </div>
        `;
    });

    vat = subtotal * 0.05;
    total = subtotal + vat;

    const totalEl = document.getElementById("total");
    if (totalEl) {
        totalEl.innerText = "Total: $" + total.toFixed(2);
    }
}

// =======================
// GENERATE RECEIPT
// =======================
function printReceipt() {
    if (cartItems.length === 0) {
        alert("Cart is empty!");
        return;
    }

    document.getElementById("orderNumber").innerText =
        Math.floor(1000 + Math.random() * 9000);

    document.getElementById("receiptDate").innerText =
        new Date().toLocaleString();

    document.getElementById("receiptChair").innerText =
        document.getElementById("clientChair")?.value || "N/A";

    const itemsDiv = document.getElementById("receipt-items");
    itemsDiv.innerHTML = "";

    cartItems.forEach(item => {
        itemsDiv.innerHTML += `
            <p>${item.qty} ${item.name} .... $${(item.price * item.qty).toFixed(2)}</p>
        `;
    });

    document.getElementById("receipt-subtotal").innerText =
        subtotal.toFixed(2);

    document.getElementById("vat-tex").innerText =
        vat.toFixed(2);

    document.getElementById("receipt-total").innerText =
        total.toFixed(2);

    document.getElementById("receipt").style.display = "block";
}

// =======================
// CLEAR CART (OPTIONAL)
// =======================
function clearCart() {
    cartItems = [];
    saveCart();
    updateCart();
}
