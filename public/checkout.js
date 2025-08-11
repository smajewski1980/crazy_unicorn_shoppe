const invoiceTableBody = document.getElementById('invoice-table-body');
const invoiceTableFoot = document.getElementById('invoice-table-foot');
const orderObject = {};

async function getCheckoutData() {
  try {
    const response = await fetch('/cart/checkout');
    const data = await response.json();
    console.log(data);
    populateCheckoutData(data);
  } catch (error) {
    console.log(error);
  }
}
// this creates the html for the invoice data
function populateCheckoutData(data) {
  console.log(data);
  let htmlString = '';
  let invoiceSubtotal = 0;
  // there would always be at least one item
  // so pull the cart id and user from the first item in the array
  const cartId = data[0].cart_id;
  const userId = data[0].user_id;

  // the html for the controls to be generated with every table row
  const itemControls = `
    <div class="invoice-item-controls-wrapper">
      <img data-action="sub" src="./assets/icons/minus.png" alt="subtract from quantity"/>
      <img data-action="add" src="./assets/icons/plus.png" alt="add to quantity"/>
      <img data-action="rem" src="./assets/icons/remove.png" alt="remove item from cart"/>
    </div>
  `;

  // loop through adding to the subtotal
  // and generating html for each item
  data.forEach((item) => {
    invoiceSubtotal += item.item_qty * item.product_price;
    htmlString += `
      <tr><td>${item.item_qty}<td data-prod-id=${
      item.product_id
    }>${itemControls}</td><td>${item.product_name}</td><td>$${
      item.product_price
    }</td><td>$${item.item_qty * item.product_price}</td></tr>
    `;
  });

  invoiceTableBody.innerHTML = htmlString;

  invoiceTableFoot.innerHTML = `<tr><td></td><td></td><td></td><th>Invoice Subtotal</th><td>$${invoiceSubtotal}</td></tr>`;
  // if the order is over 99 dollars, free shipping, woo hoo! otherwise we just tack on 10%
  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><td></td><th>Shipping</th><td>${
    invoiceSubtotal > 99 ? 'FREE' : `$${(invoiceSubtotal * 0.1).toFixed(2)}`
  }</td></tr>`;

  // the adds the shipping and the subtotal to use to calculate the tax
  const taxCalc =
    (invoiceSubtotal > 99 ? 0 : invoiceSubtotal * 0.1) + invoiceSubtotal;
  // add in 8% tsales tax
  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><td></td><th>Sales Tax</th><td>$${(
    taxCalc * 0.08
  ).toFixed(2)}</td></tr>`;

  const total =
    taxCalc * 0.08 +
    (invoiceSubtotal > 99 ? 0 : invoiceSubtotal * 0.1) +
    invoiceSubtotal;
  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><td></td><th>Total</th><td>$${total.toFixed(
    2,
  )}</td></tr>`;

  // add this info to the order object for sending to the server
  orderObject.cart_id = cartId;
  orderObject.user_id = userId;
  orderObject.order_total = total;

  // this will handle the updating of the cart/invoice on user input
  function handleInvoiceControlAction(e) {
    const productId = e.target.closest('td').dataset.prodId;
    const action = e.target.dataset.action;
    const currentQty = parseInt(
      e.target.closest('tr').querySelector('td').textContent,
    );
    switch (action) {
      case 'add':
        updateCartQty(productId, currentQty + 1);
        break;
      case 'sub':
        updateCartQty(productId, currentQty - 1);
        break;
      case 'rem':
        updateCartRem(productId);
        break;
      default:
        console.log('somehow, you found a fourth option');
        break;
    }
  }

  // the update cart functions
  async function updateCartQty(id, newQty) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: id,
        item_qty: newQty,
      }),
    };
    try {
      const response = await fetch('/cart', options);
      const data = await response.json();
      if (response.status === 200) {
        console.log(data);
        getCheckoutData();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function updateCartRem(id) {
    try {
      const response = await fetch(`/cart/${id}`, { method: 'DELETE' });
      console.log(response);
      if (response.status === 204) {
        getCheckoutData();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // add listeners for the product controls
  const allControlBtns = document.querySelectorAll(
    '.invoice-item-controls-wrapper img',
  );

  allControlBtns.forEach((btn) => {
    btn.addEventListener('click', handleInvoiceControlAction);
  });
}

const paymentBtns = document.querySelectorAll('.payment-img-wrapper');
const paymentModal = document.getElementById('payment-modal');
const paymentH4 = paymentModal.querySelector('h4');
const btnPaymentModal = document.getElementById('btn-payment-modal');
const shippingSectionEl = document.getElementById('shipping-section');

// this handles when the payment method is selected
// opens a modal with a message to then continue to review the shipping info
function handlePaymentBtn(e) {
  const paymentMethod = e.target.closest('.payment-img-wrapper').dataset
    .payType;
  paymentH4.textContent = `Thank you for choosing to pay with: ${paymentMethod}`;
  orderObject.payment_method = paymentMethod;
  paymentModal.showModal();
}

const shippingConfirmWrapper = document.getElementById(
  'shipping-confirm-info-wrapper',
);
const confirmName = document.getElementById('input-name');
const confirmEmail = document.getElementById('input-email');
const confirmPhone = document.getElementById('input-phone');
const confirmAddressOne = document.getElementById('input-address-1');
const confirmAddressTwo = document.getElementById('input-address-2');
const confirmCity = document.getElementById('input-city');
const confirmState = document.getElementById('input-state');
const confirmZip = document.getElementById('input-zip');

// populates the confirm info form
async function populateShippingSection() {
  try {
    const response = await fetch('/user/status');
    const data = await response.json();
    // console.log(data);
    confirmName.value = data.name;
    confirmEmail.value = data.email;
    confirmPhone.value = data.phone;
    confirmAddressOne.value = data.address_line_1;
    confirmAddressTwo.value = data.address_line_2;
    confirmCity.value = data.city;
    confirmState.value = data.state;
    confirmZip.value = data.zip_code;
    // console.log(orderObject);
  } catch (error) {
    console.log(error);
  }
}

// after the modal closes, show the form that was hiding
async function handlePaymentModal() {
  paymentModal.close();
  // add logic for our "random payment denial"
  // there is a payment endpoint with a 1 in 15 chance that it returns denied
  try {
    const response = await fetch('/cart/checkout', { method: 'POST' });
    console.log(response.status);
    if (response.status === 400) {
      alert('Your payment was denied, please try again.');
    } else if (response.status === 200) {
      populateShippingSection();
      shippingSectionEl.style.display = 'block';
      // make the payment buttons unclickable and grey out the non selected one
      paymentBtns.forEach((btn) => {
        btn.style.pointerEvents = 'none';
        if (btn.dataset.payType !== orderObject.payment_method) {
          btn.style.opacity = '.35';
        }
      });
    } else {
      alert('something weird happened, try again');
    }
  } catch (error) {
    console.log(error);
  }
}

btnPaymentModal.addEventListener('click', handlePaymentModal);

paymentBtns.forEach((btn) => {
  btn.addEventListener('click', handlePaymentBtn);
});

getCheckoutData();

const btnEditInfo = document.getElementById('btn-edit-info');
const btnPlaceOrder = document.getElementById('btn-place-order');

async function handleSaveChanges(e) {
  e.preventDefault();
  const form = new FormData(shippingConfirmWrapper);
  const formData = Object.fromEntries(form);
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  };
  try {
    const response = await fetch(`/user/${orderObject.user_id}`, options);
    if (response.status === 201) {
      // reverse all the stuff we changed to go from edit to save
      // lock out the fields again
      shippingConfirmWrapper.style.setProperty('--pointer-ev', 'none');
      // change button text back
      btnEditInfo.innerText = 'Edit Info';
      // reactivate the place order button
      btnPlaceOrder.style.pointerEvents = 'auto';
      btnPlaceOrder.style.opacity = '1';
      // swap the listeners back
      btnEditInfo.removeEventListener('click', handleSaveChanges);
      btnEditInfo.addEventListener('click', handleEditInfo);
    }
  } catch (error) {
    console.log(error);
  }
}

function handleEditInfo(e) {
  e.preventDefault();
  // undo pointer events none on the fields
  shippingConfirmWrapper.style.setProperty('--pointer-ev', 'auto');
  // change edit button text, grey out order btn and swap listener
  btnEditInfo.innerText = 'Save Changes';
  // deactivate the place order button
  btnPlaceOrder.style.pointerEvents = 'none';
  btnPlaceOrder.style.opacity = '.5';
  // swap the listeners
  btnEditInfo.removeEventListener('click', handleEditInfo);
  btnEditInfo.addEventListener('click', handleSaveChanges);
}

const orderCompleteModal = document.getElementById('order-complete-modal');
const orderModalConf = document.getElementById('order-conf-num');
const orderModalMsg = document.getElementById('order-conf-msg');
const btnOrderModal = document.getElementById('btn-order-modal');

function populateOrderCompleteModal(confNum) {
  orderModalConf.textContent = `Your order number is: ${confNum}`;
  orderModalMsg.textContent = `Thank you for your order ${confirmName.value}! You will not receive an email shortly with your order details, but feel free to go to the orders page and see the order details there.`;
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderObject),
  };

  try {
    const response = await fetch('/order', options);
    const data = await response.json();
    if (response.ok) {
      // get rid of the info for the now complete order
      const mainEl = document.getElementById('invoice-wrapper');
      mainEl.style.display = 'none';
      //poulate the dynamic parts of the modal
      populateOrderCompleteModal(data.order_id);
      console.log(data.msg);
      orderCompleteModal.showModal();
    }
  } catch (error) {
    console.log(error);
  }
}

btnEditInfo.addEventListener('click', handleEditInfo);
btnPlaceOrder.addEventListener('click', handlePlaceOrder);

btnOrderModal.addEventListener('click', () => {
  window.location.href = '/index.html';
});
