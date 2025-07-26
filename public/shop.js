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
  addProductToHTML() {
    const div = document.createElement('div');
    div.classList.add('product-card');
    div.dataset.prodId = this.productId;

    const h3 = document.createElement('h3');
    h3.textContent = this.productName;

    const catP = document.createElement('p');
    catP.textContent = `Category: ${getProdCategory(this.categoryId)}`;
    catP.classList.add('card-category-title');

    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('card-img-wrapper');
    const img = document.createElement('img');
    img.src = this.imageURL;
    img.alt = this.productName;
    imgWrapper.appendChild(img);

    const prodInfoDiv = document.createElement('div');
    prodInfoDiv.classList.add('product-info-content');
    const descP = document.createElement('p');
    descP.classList.add('product-desc');
    descP.textContent = this.productDescription;
    const priceP = document.createElement('p');
    priceP.innerHTML = `<span>$ </span>${this.productPrice}`;
    priceP.classList.add('card-prod-price');
    prodInfoDiv.appendChild(descP);
    prodInfoDiv.appendChild(priceP);

    div.appendChild(h3);
    div.appendChild(catP);
    div.appendChild(imgWrapper);
    div.appendChild(prodInfoDiv);
    productsDiv.appendChild(div);
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
    // take the data and create a class object for each product
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
      // put them all in an array
      productObjects.push(classObj);
    }
    productObjects.forEach((p) => {
      p.addProductToHTML();
    });
  } catch (error) {
    console.log(error);
  }
}

const h1Elem = document.querySelector('h1');
const h2Elem = document.querySelector('h2');

function runH1Animation() {
  h1Elem.classList.add('h1-animation');
  setTimeout(() => {
    h1Elem.classList.remove('h1-animation');
  }, 1500);
}

function updateCardsTitle(category) {
  h2Elem.innerText = category;
}

// filter the productObjects and add them to the html
function filterProducts(categoryId) {
  productsDiv.innerHTML = '';
  const filteredProducts = productObjects.filter(
    (p) => p.categoryId === parseInt(categoryId),
  );

  filteredProducts.forEach((p) => {
    p.addProductToHTML();
  });
}

document.addEventListener('click', (e) => {
  // get the product id if a card was clicked
  const productCard = e.target.closest('.product-card');
  // if a select option is clicked
  const option = e.target.closest('option');
  // get the category
  const categoryId = option.value;
  const category = getProdCategory(parseInt(categoryId));

  if (productCard) {
    const prodId = productCard.dataset.prodId;
    console.log(prodId);
    // later going to have a modal with more info and bigger pic
    // open when a card is clicked
  }

  // runs the h1 text animation
  if (option) {
    runH1Animation();
    updateCardsTitle(category);
    filterProducts(categoryId);
  }
});

getAllProducts();
