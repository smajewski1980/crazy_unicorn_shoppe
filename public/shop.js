const productsDiv = document.getElementById('product-cards-wrapper');
// tbd if this array with the Product objects was needed or not
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

// take the category_id and return the appropriate string
function getProdCategory(catId) {
  switch (catId) {
    case 1:
      return 'Food & Beverage';
      break;
    case 2:
      return 'Fashion and Accessories';
      break;
    case 3:
      return 'Electronics';
      break;
    case 4:
      return 'Home Decor';
      break;
    case 5:
      return 'Gifts and Gadgets of Crazy';
      break;
    default:
      break;
  }
}

// get and display all the products
async function getAllProducts() {
  try {
    const response = await fetch('/products');
    const data = await response.json();

    console.log(data);

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

      const classObj = new Product(
        category_id,
        current_qty,
        image_url,
        max_qty,
        min_qty,
        product_description,
        product_id,
        product_name,
        product_price,
      );
      productObjects.push(classObj);

      const div = document.createElement('div');
      div.classList.add('product-card');
      div.dataset.prodId = product_id;

      const h3 = document.createElement('h3');
      h3.textContent = product_name;

      const catP = document.createElement('p');
      catP.textContent = `Category: ${getProdCategory(category_id)}`;
      catP.classList.add('card-category-title');

      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('card-img-wrapper');
      const img = document.createElement('img');
      img.src = image_url;
      img.alt = product_name;
      imgWrapper.appendChild(img);

      const prodInfoDiv = document.createElement('div');
      prodInfoDiv.classList.add('product-info-content');
      const descP = document.createElement('p');
      descP.classList.add('product-desc');
      descP.textContent = product_description;
      const priceP = document.createElement('p');
      priceP.innerHTML = `<span>$ </span>${product_price}`;
      priceP.classList.add('card-prod-price');
      prodInfoDiv.appendChild(descP);
      prodInfoDiv.appendChild(priceP);

      div.appendChild(h3);
      div.appendChild(catP);
      div.appendChild(imgWrapper);
      div.appendChild(prodInfoDiv);
      productsDiv.appendChild(div);
    }
  } catch (error) {
    console.log(error);
  }
}

// get the product id of the card that was clicked
document.addEventListener('click', (e) => {
  const productCard = e.target.closest('.product-card');

  if (productCard) {
    const prodId = productCard.dataset.prodId;
    console.log(prodId);
  }
  // later going to have a modal with more info and bigger pic
  // open when a card is clicked
});

getAllProducts();
