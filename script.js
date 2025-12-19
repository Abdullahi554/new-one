/* =====================
   CART STORAGE
===================== */
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let subtotal = 0, vat = 0, total = 0;

document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    fetchAllReceipts(); // table fetch only if table exists
});

function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function addToCart(name, price) {
    let item = cartItems.find(i => i.name === name);
    if (item) item.qty++;
    else cartItems.push({ name, price, qty: 1 });
    saveCart();
    updateCart();
}

function removeFromCart(name) {
    cartItems = cartItems.filter(item => item.name !== name);
    saveCart();
    updateCart();
}

/* =====================
   CART UI
===================== */
function updateCart() {
    const cartDiv = document.getElementById("cart");
    if (!cartDiv) return;

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
    if (totalEl) totalEl.innerText = "Total: $" + total.toFixed(2);
}

/* =====================
   PRINT RECEIPT
===================== */
function printReceipt() {
    if (cartItems.length === 0) return alert("Cart is empty!");

    const chairInput = document.getElementById("clientChair");
    if (!chairInput || !chairInput.value) return alert("Enter chair number!");

    const chair = parseInt(chairInput.value);
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const receiptDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    subtotal = cartItems.reduce((acc, i) => acc + i.price*i.qty, 0);
    vat = subtotal * 0.05;
    total = subtotal + vat;

    // show receipt preview
    document.getElementById("orderNumber").innerText = orderNumber;
    document.getElementById("receiptDate").innerText = receiptDate;
    document.getElementById("receiptChair").innerText = chair;

    const itemsDiv = document.getElementById("receipt-items");
    itemsDiv.innerHTML = "";
    cartItems.forEach(i => {
        itemsDiv.innerHTML += `<p>${i.qty} x ${i.name} — $${(i.price*i.qty).toFixed(2)}</p>`;
    });

    document.getElementById("receipt-subtotal").innerText = subtotal.toFixed(2);
    document.getElementById("vat-tex").innerText = vat.toFixed(2);
    document.getElementById("receipt-total").innerText = total.toFixed(2);
    document.getElementById("receipt").style.display = "block";

    // send to DB
    sendReceiptToServer({
        orderNumber,
        chair,
        receiptDate,
        items: cartItems,
        subtotal,
        vat,
        total
    });
}

/* =====================
   SEND TO DATABASE
===================== */
function sendReceiptToServer(data) {
    fetch("save_receipt.php", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        if(res.status !== "success") {
            alert(res.message);
            return;
        }
        alert("Receipt printed & saved successfully!");
        clearCart();
    })
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}

/* =====================
   FETCH TABLE (ONLY IF EXISTS)
===================== */
function fetchAllReceipts() {
    const tbody = document.getElementById("receiptTableBody");
    if(!tbody) return;

    fetch("fetch_receipts.php")
        .then(res => res.json())
        .then(res => {
            if(res.status !== "success") return;

            tbody.innerHTML = "";
            res.data.forEach(row => {
                const itemsText = JSON.parse(row.items)
                    .map(i=>`${i.qty}x ${i.name}`)
                    .join(", ");

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.order_number}</td>
                    <td>${row.chair}</td>
                    <td>${row.date}</td>
                    <td>${itemsText}</td>
                    <td>${row.subtotal}</td>
                    <td>${row.vat}</td>
                    <td>${row.total}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error(err));
}

/* =====================
   CLEAR CART
===================== */
function clearCart() {
    cartItems = [];
    saveCart();
    updateCart();
}
