const invoiceTableBody = document.getElementById('invoice-table-body');
const invoiceTableFoot = document.getElementById('invoice-table-foot');

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
}

getCheckoutData();
