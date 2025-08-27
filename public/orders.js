import { toasty } from './utils/toasty.js';
const ordersTableBody = document.querySelector('#orders-summary-main tbody');
const orderReviewModal = document.getElementById('order-review-modal');
const orderReviewH2 = document.getElementById('order-review-h2');
const orderReviewCaption = document.getElementById('order-review-caption');
const orderReviewTbody = document.getElementById('order-review-tbody');
const orderReviewFootSub = document.getElementById('order-review-foot-sub');
const orderReviewFootShip = document.getElementById('order-review-foot-ship');
const orderReviewFootTax = document.getElementById('order-review-foot-tax');
const orderReviewFootTotal = document.getElementById('order-review-foot-total');
const orderReviewModalBtn = document.getElementById('btn-close-order-review');
const btnOrderCancel = document.getElementById('btn-cancel-order');

// this function will reformat the db timestamp
function formatDate(date) {
  const newDate = date.split('T')[0];
  const dateParts = newDate.split('-');
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${month}-${day}-${year}`;
}

// format the price field
function formatBucks(price) {
  // if theres free shipping, show it
  if (price === 0) return 'FREE';

  const num = parseFloat(price);
  return `$${num.toFixed(2)}`;
}

// starts the chain of events to populate the data on the page
async function getUser() {
  try {
    const response = await fetch('/user/status');
    const data = await response.json();
    const userId = data.user_id;
    getUserOrders(userId);
  } catch (error) {
    console.log(error);
  }
}

async function getUserOrders(userId) {
  try {
    const response = await fetch(`/order/${userId}/all`);
    const data = await response.json();
    if (response.status === 401) {
      toasty('something went wrong', 'home');
      return;
    }
    displayOrderData(data);
  } catch (error) {
    console.log(error);
  }
}

function displayOrderData(data) {
  let htmlStr = '';
  data.forEach((o) => {
    const tableRow = `
      <tr tabindex="0" data-order-id="${o.order_id}" data-status="${
      o.order_status
    }">
        <td>${o.order_id}</td>
        <td>${formatDate(o.order_date)}</td>
        <td>${formatBucks(o.order_total)}</td>
        <td>${o.payment_method}</td>
        <td>${o.order_status}</td>
      </tr>
    `;
    htmlStr += tableRow;
  });
  ordersTableBody.innerHTML = htmlStr;
  const tableRows = ordersTableBody.querySelectorAll('tr');
  // add a listener to each row so when clicked, a modal with details opens
  tableRows.forEach((r) => {
    r.addEventListener('click', handleOrderClick);
  });
  tableRows.forEach((r) => {
    r.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleOrderClick(e);
      }
      return;
    });
  });
}

// populate and open the order review modal
async function handleOrderClick(e) {
  const orderId = e.target.closest('tr').dataset.orderId;
  orderReviewModal.dataset.orderId = orderId;
  let subtotal = 0;
  btnOrderCancel.style.display = 'none';
  const status = e.target.closest('tr').dataset.status;
  try {
    const response = await fetch(`/order/${orderId}`);
    const data = await response.json();
    if (status === 'pending') {
      btnOrderCancel.style.display = 'block';
    }
    orderReviewH2.textContent = `Order number: ${orderId}`;
    orderReviewCaption.textContent = `Order was placed on ${formatDate(
      data.order_date,
    )} with ${data.payment_method}`;

    let orderItemHtml = '';

    data.order_items.forEach((i) => {
      subtotal += parseFloat(i.item_subtotal);
      const newTr = `
        <tr>
          <td>${i.item_qty}</td>
          <td>${i.product_name}</td>
          <td>${formatBucks(i.product_price)}</td>
          <td>${formatBucks(i.item_subtotal)}</td>
        </tr>
      `;
      orderItemHtml += newTr;
    });

    // prepare the footer info and populate
    orderReviewFootSub.textContent = formatBucks(subtotal);
    const shipping = subtotal > 99 ? 0 : subtotal * 0.1;
    orderReviewFootShip.textContent = formatBucks(shipping);
    const tax = (subtotal + shipping) * 0.08;
    orderReviewFootTax.textContent = formatBucks(tax);
    const orderTotal = subtotal + shipping + tax;
    orderReviewFootTotal.textContent = formatBucks(orderTotal);
    orderReviewTbody.innerHTML = orderItemHtml;

    orderReviewModal.showModal();
  } catch (error) {
    console.log(error);
  }
}

async function handleOrderCancel(e) {
  const orderId = e.target.closest('dialog').dataset.orderId;
  try {
    const response = await fetch(`/order/${orderId}`, { method: 'DELETE' });
    if (response.ok) {
      toasty(
        `Order number ${orderId} has been succesfully canceled.`,
        'reload',
      );
      orderReviewModal.close();
      ordersTableBody.inert = true;
      return;
    }
  } catch (error) {
    console.log(error);
    toasty('something went wrong, please try again', 'home');
  }
}

orderReviewModalBtn.addEventListener('click', () => {
  orderReviewModal.close();
});

btnOrderCancel.addEventListener('click', handleOrderCancel);

getUser();
