import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk",
    authDomain: "primeroastweb.firebaseapp.com",
    databaseURL: "https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "primeroastweb",
    storageBucket: "primeroastweb.appspot.com",
    messagingSenderId: "157736544071",
    appId: "1:157736544071:web:2713ba60d8edddc5344e62",
    measurementId: "G-MGMCTZCX2G"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);
const DELIVERY_FEE = 50.00;

// Function to fetch and display order details for the current user
function fetchAndDisplayOrders(currentUserUID) {
    const userOrdersPath = `/orders/${currentUserUID}`;
    const dbRef = ref(db, userOrdersPath);

    get(dbRef).then((snapshot) => {
        const ordersTableBody = document.getElementById("orders-table-body");
        const noOrdersOverlay = document.getElementById("no-orders-overlay");
        ordersTableBody.innerHTML = "";

        if (snapshot.exists()) {
            const orders = snapshot.val();
            let hasOrders = false;

            Object.keys(orders).forEach(batchIndex => {
                const batch = orders[batchIndex];
                if (batch && typeof batch === 'object') {
                    hasOrders = true;

                    const batchContainer = document.createElement("div");
                    batchContainer.classList.add("batch-container");

                    const batchTitle = document.createElement("h3");
                    batchTitle.classList.add("batch-title");
                    batchTitle.textContent = `Order Batch #${batchIndex}`;
                    batchContainer.appendChild(batchTitle);

                    const contactNumber = batch.contactNumber || "N/A";
                    const address = batch.location?.address || "N/A";
                    const orderTime = batch.orderTime || "N/A";
                    const status = batch.Status || "N/A";

                    const table = document.createElement("table");
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;
                    const tableBody = table.querySelector("tbody");
                    let totalPrice = 0;

                    const orderItems = batch.orderItems || {};
                    Object.keys(orderItems).forEach(itemId => {
                        const item = orderItems[itemId];
                        const productName = item.productName || "N/A";
                        const quantity = item.quantity || 1;
                        const price = item.price || 0;

                        totalPrice += price * quantity;

                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${productName}</td>
                            <td>${quantity}</td>
                            <td>₱${(price * quantity).toFixed(2)}</td>
                        `;
                        tableBody.appendChild(row);
                    });

                    const totalRow = document.createElement("tr");
                    totalRow.innerHTML = `
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>₱${(totalPrice + DELIVERY_FEE).toFixed(2)}</strong></td>
                    `;
                    tableBody.appendChild(totalRow);

                    const orderDetails = document.createElement("div");
                    orderDetails.classList.add("order-details");
                    orderDetails.innerHTML = `
                        <p><strong>Contact:</strong> ${contactNumber}</p>
                        <p><strong>Address:</strong> ${address}</p>
                        <p><strong>Order Time:</strong> ${orderTime}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        <button type="button" id="CancelOrderBtn-${batchIndex}" class="cancel-order-btn">Cancel Order</button>
                    `;

                    // Add event listener for Cancel Order button
                    orderDetails.querySelector(`#CancelOrderBtn-${batchIndex}`).addEventListener("click", () => {
                        swal({
                            title: "Are you sure?",
                            text: "Once deleted, you will not be able to recover this order!",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        }).then((willDelete) => {
                            if (willDelete) {
                                const orderRef = ref(db, `/orders/${currentUserUID}/${batchIndex}`);
                                remove(orderRef)
                                    .then(() => {
                                        swal("Order has been deleted!", {
                                            icon: "success",
                                        });
                                        batchContainer.remove();
                                    })
                                    .catch((error) => {
                                        console.error("Error deleting order:", error);
                                        swal("Failed to delete order. Please try again.", {
                                            icon: "error",
                                        });
                                    });
                            } else {
                                swal("Your order is safe!");
                            }
                        });
                    });

                    batchContainer.appendChild(table);
                    batchContainer.appendChild(orderDetails);
                    ordersTableBody.appendChild(batchContainer);
                }
            });

            noOrdersOverlay.style.display = hasOrders ? "none" : "flex";
        } else {
            noOrdersOverlay.style.display = "flex";
        }
    }).catch(error => {
        console.error("Error fetching orders:", error);
    });
}

// Check if user is authenticated and then fetch orders
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAndDisplayOrders(user.uid);
    } else {
        console.error("User is not authenticated.");
    }
});
