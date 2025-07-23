const productsDiv = document.getElementById('product-cards-wrapper');
const productObjects = [];
class Product {
  constructor(
    categoryId,
    currentQty,
    imageURL,
    maxQty,
    minQty,
    productDescription,
    productId,
    productName,
    productPrice,
  ) {
    this.categoryId = categoryId;
    this.currentQty = currentQty;
    this.imageURL = imageURL;
    this.maxQty = maxQty;
    this.minQty = minQty;
    this.productDescription = productDescription;
    this.productId = productId;
    this.productName = productName;
    this.productPrice = productPrice;
  }
  productGetInfo() {
    console.log(this);
  }
}

async function getAllProducts() {
  try {
    const response = await fetch('/products');
    const data = await response.json();

    for (const prod of data) {
      const {
        category_id,
        current_qty,
        image_url,
        max_qty,
        min_qty,
        product_description,
        product_id,
        product_name,
        product_price,
      } = prod;
      const div = document.createElement('div');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      h3.textContent = product_name;
      p.textContent = `id: ${product_id}; price: ${product_price} on hand: ${current_qty}`;
      div.appendChild(h3);
      div.appendChild(p);
      productsDiv.appendChild(div);
    }
  } catch (error) {
    console.log(error);
  }
}

getAllProducts();
