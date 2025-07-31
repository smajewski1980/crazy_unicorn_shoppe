const ordersTableBody = document.querySelector('#orders-summary-main tbody');
const orderReviewModal = document.getElementById('order-review-modal');
const orderReviewInfoEl = document.getElementById('order-review-info');
const orderReviewModalBtn = orderReviewModal.querySelector('button');

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
    displayOrderData(data);
  } catch (error) {
    console.log(error);
  }
}

function displayOrderData(data) {
  let htmlStr = '';
  data.forEach((o) => {
    const tableRow = `
      <tr data-order-id="${o.order_id}" data-cart-id="${o.cart_id}">
        <td>${o.order_id}</td>
        <td>${o.order_date}</td>
        <td>${o.order_total}</td>
        <td>${o.payment_method}</td>
      </tr>
    `;
    htmlStr += tableRow;
  });
  ordersTableBody.innerHTML = htmlStr;
  const tableRows = ordersTableBody.querySelectorAll('tr');
  tableRows.forEach((r) => {
    r.addEventListener('click', handleOrderClick);
  });
}

function handleOrderClick(e) {
  const orderId = e.target.closest('tr').dataset.orderId;
  const cartId = e.target.closest('tr').dataset.cartId;
  // will have to fetch the info for the order
  orderReviewInfoEl.innerText = `The order id is: ${orderId}, and the cart id is : ${cartId}`;
  orderReviewModal.showModal();
}

orderReviewModalBtn.addEventListener('click', () => {
  orderReviewModal.close();
});

getUser();
