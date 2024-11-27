// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref,push, set, remove, update, onValue,get } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
document.getElementById('variantModalClose').addEventListener('click', closeModal);
function closeModal() {
    const modal = document.getElementById("variantModal");
    modal.style.display = "none";
}


function addToCart(productId, productName, productImage, quantity, variants) {
    // Populate modal with variant options
    const variantOptionsDiv = document.getElementById("variantOptions");
    variantOptionsDiv.innerHTML = ""; // Clear any previous options

    variants.forEach((variant, index) => {
        const option = document.createElement("div");
        option.innerHTML = `<input type="radio" name="variant" value="${variant.price}" id="variant${index}">
                            <label for="variant${index}">${variant.name} - ${variant.price}</label>`;
        variantOptionsDiv.appendChild(option);
    });

    // Show the modal
    const modal = document.getElementById("variantModal");
    modal.style.display = "block";

    // Attach an event listener to confirm selection
    window.confirmVariant = () => {
        const selectedVariant = document.querySelector('input[name="variant"]:checked');
        if (!selectedVariant) {
            alert("Please select a variant");
            return;
        }

        const variantPrice = selectedVariant.value;
        const fullText = selectedVariant.nextElementSibling.textContent;
        const variantName = fullText.split(" - ")[0]; // Get only the variant name
        modal.style.display = "none"; // Close the modal
        

        // Proceed to add item to cart
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userUID = user.uid;
                const userCartRef = ref(db, `users/${userUID}/cart`);
                const newCartItemRef = push(userCartRef);
                const cartItemId = newCartItemRef.key;

                set(newCartItemRef, {
                    productId: productId,
                    cartItemId: cartItemId,
                    productName: variantName,
                    productImage: productImage,
                    quantity: quantity,
                    variant: variantName,
                    price: variantPrice
                }).then(() => {
                    console.log('Product added to cart with variant successfully!');
                }).catch((error) => {
                    console.error('Error adding product to cart:', error);
                });
            } else {
                console.log('No user is logged in.');
            }
        });
    };
}



export function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();

            const productSquare = event.target.closest('.product-square');
            const productId = productSquare.getAttribute('data-index');
            const productName = productSquare.querySelector('p').textContent;
            const productImage = productSquare.querySelector('img').getAttribute('src');
            const quantity = parseInt(productSquare.querySelector('.quantity-selector span').textContent);

            // Retrieve variants from Firebase
            try {
                const productRef = ref(db, `products/${productId}`);
                const productSnapshot = await get(productRef);

                if (productSnapshot.exists()) {
                    const productData = productSnapshot.val();
                    const variants = Object.entries(productData.variant).map(([key, value]) => {
                        const [name, price] = value.split(" + ");
                        return { name, price };
                    });

                    // Show modal to choose variant before adding to cart
                    addToCart(productId, productName, productImage, quantity, variants);
                } else {
                    console.log("Product not found in database.");
                }
            } catch (error) {
                console.error("Error fetching product variants:", error);
            }
        });
    });
}


// Add event listeners to the floating cart button and close button
document.getElementById('cartButton').addEventListener('click', showCart);
document.getElementById('closeModalBtn').addEventListener('click', toggleCartModal);
document.getElementById('addLocationBtn').addEventListener('click', showAddLocationForm);
document.getElementById('saveLocationBtn').addEventListener('click', saveLocation);

function toggleCartModal() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('show');
}

function showLocations(userUid) {
    const locationSelect = document.getElementById('locationSelect');
    locationSelect.innerHTML = '';

    const locationsRef = ref(db, `/users/${userUid}/locations`);
    onValue(locationsRef, (snapshot) => {
        const locations = snapshot.val();

        if (locations) {
            Object.keys(locations).forEach((locationId) => {
                const location = locations[locationId];

                const option = document.createElement('option');
                option.value = locationId;
                option.textContent = `${location.name} - ${location.address}`;
                locationSelect.appendChild(option);
            });
        } else {
            const placeholderOption = document.createElement('option');
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.textContent = 'No locations available';
            locationSelect.appendChild(placeholderOption);
        }
    });
}

function showCart() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userUid = user.uid;
            const cartRef = ref(db, `/users/${userUid}/cart`);

            onValue(cartRef, (snapshot) => {
                const cartItemsDiv = document.getElementById('cartItems');
                cartItemsDiv.innerHTML = '';
                let totalPrice = 0;

                const cartItems = snapshot.val();

                if (cartItems) {
                    Object.keys(cartItems).forEach((cartItemId) => {
                        const { productName, productImage, quantity, price } = cartItems[cartItemId];
                        const itemTotalPrice = price * quantity;
                        totalPrice += itemTotalPrice;

                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'cart-item';
                        itemDiv.innerHTML = `
                            <img src="${productImage}" alt="${productName}" style="width:50px;height:50px;"/>
                            <span>${productName}</span>
                            <span>Price: ${price}</span>
                            <span>Total: ${itemTotalPrice}</span>
                            <input id="quantity-${cartItemId}" type="number" value="${quantity}" min="1" />
                            <button id="delete-${cartItemId}">Delete</button>
                        `;

                        cartItemsDiv.appendChild(itemDiv);

                        document.getElementById(`quantity-${cartItemId}`).addEventListener('change', function(event) {
                            event.preventDefault();
                            updateQuantity(cartItemId, this.value, event);
                        });

                        document.getElementById(`delete-${cartItemId}`).addEventListener('click', function() {
                            deleteCartItem(cartItemId);
                        });
                    });

                    const totalDiv = document.createElement('div');
                    totalDiv.className = 'cart-total';
                    totalDiv.innerHTML = `<strong>Total Price: PHP ${totalPrice}</strong>`;
                    cartItemsDiv.appendChild(totalDiv);
                } else {
                    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
                }

                showLocations(userUid);
                toggleCartModal();
            });
        }
    });
}

// Show the "Add Location" form
function showAddLocationForm() {
    document.getElementById('addLocationForm').classList.toggle('hidden');
}

// Save new location to Firebase
function saveLocation() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userUid = user.uid;
            const newLocationName = document.getElementById('newLocationName').value;
            const newLocationAddress = document.getElementById('newLocationAddress').value;

            if (newLocationName && newLocationAddress) {
                const newLocationRef = push(ref(db, `/users/${userUid}/locations`));
                set(newLocationRef, {
                    name: newLocationName,
                    address: newLocationAddress
                }).then(() => {
                    showLocations(userUid); // Refresh locations dropdown
                    document.getElementById('newLocationName').value = '';
                    document.getElementById('newLocationAddress').value = '';
                    document.getElementById('addLocationForm').classList.add('hidden'); // Hide form
                }).catch((error) => {
                    console.error('Error saving location:', error);
                });
            }
        }
    });
}


// Function to update the quantity of a cart item
function updateQuantity(cartItemId, newQuantity, event) {
    // Prevent default behavior of the input change event
    if (event) {
        event.preventDefault();
    }

    // Convert newQuantity to an integer
    const quantityInt = parseInt(newQuantity, 10);

    if (isNaN(quantityInt) || quantityInt <= 0) {
        console.error("Invalid quantity: must be a positive integer.");
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userUid = user.uid;
            const itemRef = ref(db, `/users/${userUid}/cart/${cartItemId}`);

            update(itemRef, { quantity: quantityInt })
                .then(() => {
                    const modal = document.getElementById('cartModal');

/*
                    --- Dawata nalang na na mag sge siyag refresh kay piste na buang na bug kapyg ayu

                    quick fick rana ang modal toggle samuk kaayu murag tanga sgeg wa wa kada update bahala nana
                     ↓
                     ↓
                     ↓
*/
                    modal.classList.toggle('show'); 
                    //console.log('Quantity updated successfully');

                })
                .catch((error) => {
                    console.error('Error updating quantity:', error);
                });
        }
    });
}

// Function to delete a cart item
function deleteCartItem(cartItemId) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userUid = user.uid;
            const itemRef = ref(db, `/users/${userUid}/cart/${cartItemId}`);

            remove(itemRef).then(() => {
                console.log('Item deleted successfully');
                showCart(); // Refresh the cart after deletion
            }).catch((error) => {
                console.error('Error deleting item:', error);
            });
        }
    });
}

function placeOrder() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userUid = user.uid;
            const cartRef = ref(db, `/users/${userUid}/cart`);
            const ordersRef = ref(db, `/orders/${userUid}`);
            const orderIndexRef = ref(db, `/orderIndex/${userUid}`);
            const contactNumRef = ref(db, `users/${userUid}/contactNumber`);

            // Get selected location from the dropdown
            const locationSelect = document.getElementById('locationSelect');
            const selectedLocationId = locationSelect.value;

            if (!selectedLocationId) {
                Swal.fire({
                    title: 'Please select a location',
                    icon: 'error'
                });
                return;
            }

            get(cartRef).then((snapshot) => {
                const cartItems = snapshot.val();

                if (cartItems) {
                    get(orderIndexRef).then((indexSnapshot) => {
                        let currentIndex = indexSnapshot.val() || 0;
                        const nextIndex = currentIndex + 1;
                        const orderRef = ref(db, `/orders/${userUid}/${nextIndex}`);

                        // Generate unique order ID
                        const orderUID = `${userUid}-${nextIndex}`;

                        // Generate the QR code and convert it to a data URL
                        QRCode.toDataURL(orderUID, function (error, qrDataUrl) {
                            if (error) {
                                console.error('Error generating QR code:', error);
                                return;
                            }

                            // Fetch location details from Firebase
                            const locationRef = ref(db, `/users/${userUid}/locations/${selectedLocationId}`);
                            get(locationRef).then((locationSnapshot) => {
                                const selectedLocation = locationSnapshot.val();

                                // Fetch contact number from Firebase
                                get(contactNumRef).then((contactSnapshot) => {
                                    const contactNumber = contactSnapshot.val() || "";

                                    set(orderRef, {
                                        userId: userUid,
                                        orderItems: cartItems,
                                        orderTime: new Date().toLocaleDateString('en-US', {
                                            timeZone: 'Asia/Manila', // Set the time zone to Philippine Time
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        }) + ', ' + new Date().toLocaleTimeString('en-US', {
                                            timeZone: 'Asia/Manila', // Set the time zone to Philippine Time
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true // Use 12-hour format (AM/PM)
                                        }),
                                        location: selectedLocation,
                                        contactNumber: contactNumber,  // Include contact number
                                        qrCode: qrDataUrl, // Save QR code image as data URL
                                    Status: "Processing" // Save QR code image as data URL
                                    }).then(() => {
                                        // Clear cart after order is placed
                                        remove(cartRef).then(() => {
                                            // Update order index
                                            set(orderIndexRef, nextIndex).then(() => {
                                                // Show the coffee animation
                                                document.getElementById('coffee-wrap').style.display = 'block';

                                                // Show success alert and QR code modal after delay
                                                setTimeout(() => {
                                                    Swal.fire({
                                                        title: 'Order placed!',
                                                        icon: 'success'
                                                    });

                                                    // Hide coffee animation
                                                    document.getElementById('coffee-wrap').style.display = 'none';
                                                    generateQrCode(orderUID);
                                                    openQrModal();
                                                }, 5000);
                                            }).catch((error) => {
                                                console.error('Error updating order index:', error);
                                            });
                                        }).catch((error) => {
                                            console.error('Error clearing cart:', error);
                                        });
                                    }).catch((error) => {
                                        console.error('Error placing order:', error);
                                    });
                                }).catch((error) => {
                                    console.error('Error retrieving contact number:', error);
                                });
                            }).catch((error) => {
                                console.error('Error retrieving location:', error);
                            });
                        });
                    }).catch((error) => {
                        console.error('Error retrieving order index:', error);
                    });
                } else {
                    Swal.fire({
                        title: 'Your cart is empty!',
                        icon: 'error'
                    });
                }
            }).catch((error) => {
                console.error('Error retrieving cart items:', error);
            });
        }
    });
}


// QR Code generation function
function generateQrCode(orderUID) {
    QRCode.toCanvas(document.getElementById('qrCanvas'), orderUID, function (error) {
        if (error) console.error(error);
    });
}

// Modal control functions
function openQrModal() {
    document.getElementById('qrModal').style.display = 'flex';
}

function closeQrModal() {
    document.getElementById('qrModal').style.display = 'none';
}

// Function to download QR Code
function downloadQrCode() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'order_qr_code.png';
    link.click();
}

// Add event listener for the "Order" button
document.getElementById('OrderBtn').addEventListener('click', placeOrder);
document.getElementById('downloadQrCode').addEventListener('click', downloadQrCode);
document.getElementById('closeQrModal').addEventListener('click', closeQrModal);

document.getElementById('closeFormBtn').addEventListener('click', function() {
    document.getElementById('addLocationForm').classList.add('hidden');
});
