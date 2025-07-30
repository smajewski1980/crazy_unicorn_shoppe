const invoiceTableBody = document.getElementById('invoice-table-body');
const invoiceTableFoot = document.getElementById('invoice-table-foot');
const orderObject = {};

async function getCheckoutData() {
  try {
    const response = await fetch('/cart/checkout');
    const data = await response.json();
    populateCheckoutData(data);
  } catch (error) {
    console.log(error);
  }
}

function populateCheckoutData(data) {
  console.log(data);
  let htmlString = '';
  let invoiceSubtotal = 0;
  const cartId = data[0].cart_id;
  const userId = data[0].user_id;
  data.forEach((item) => {
    invoiceSubtotal += item.item_qty * item.product_price;
    htmlString += `
      <tr><td>${item.item_qty}</td><td>${item.product_name}</td><td>$${
      item.product_price
    }</td><td>$${item.item_qty * item.product_price}</td></tr>
    `;
  });
  invoiceTableBody.innerHTML = htmlString;

  invoiceTableFoot.innerHTML = `<tr><td></td><td></td><th>Invoice Subtotal</th><td>$${invoiceSubtotal}</td></tr>`;
  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><th>Shipping</th><td>${
    invoiceSubtotal > 99 ? 'FREE' : `$${invoiceSubtotal * 0.1}`
  }</td></tr>`;

  const taxCalc =
    (invoiceSubtotal > 99 ? 0 : invoiceSubtotal * 0.1) + invoiceSubtotal;

  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><th>Sales Tax</th><td>$${
    taxCalc * 0.08
  }</td></tr>`;

  const total =
    taxCalc * 0.08 +
    (invoiceSubtotal > 99 ? 0 : invoiceSubtotal * 0.1) +
    invoiceSubtotal;
  invoiceTableFoot.innerHTML += `<tr><td></td><td></td><th>Total</th><td>$${total}</td></tr>`;

  orderObject.cart_id = cartId;
  orderObject.user_id = userId;
  orderObject.order_total = total;
  prepareOrder(orderObject);
}

function prepareOrder(order) {
  // orderObject.crazy = true;
  console.log(order);
}

const paymentBtns = document.querySelectorAll('.payment-img-wrapper');
const paymentModal = document.getElementById('payment-modal');
const paymentH4 = paymentModal.querySelector('h4');
const btnPaymentModal = document.getElementById('btn-payment-modal');
const shippingSectionEl = document.getElementById('shipping-section');

function handlePaymentBtn(e) {
  const paymentMethod = e.target.closest('.payment-img-wrapper').dataset
    .payType;
  paymentH4.textContent = `Thank you for choosing to pay with: ${paymentMethod}`;
  orderObject.payment_method = paymentMethod;
  paymentModal.showModal();
  paymentBtns.forEach((btn) => {
    btn.style.pointerEvents = 'none';
    if (btn.dataset.payType !== paymentMethod) {
      btn.style.opacity = '.35';
    }
  });
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
    console.log(orderObject);
  } catch (error) {
    console.log(error);
  }
}

function handlePaymentModal() {
  paymentModal.close();
  populateShippingSection();
  shippingSectionEl.style.display = 'block';
}

btnPaymentModal.addEventListener('click', handlePaymentModal);

paymentBtns.forEach((btn) => {
  btn.addEventListener('click', handlePaymentBtn);
});

getCheckoutData();
