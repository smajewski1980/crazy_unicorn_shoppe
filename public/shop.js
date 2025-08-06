const productsDiv = document.getElementById('product-cards-wrapper');

const productDialog = document.getElementById('product-dialog');
const btnDialogClose = document.getElementById('btn-close');
const prodDialogTitle = document.getElementById('product-dialog-h3');
const prodDialogCategory = document.getElementById('product-dialog-category');
const prodDialogImg = document.getElementById('dialog-img');
const prodDialogDesc = document.getElementById('product-dialog-desc');
const prodDialogPrice = document.getElementById('product-dialog-price');
const prodDialogInStock = document.getElementById('product-dialog-in-stock');
const btnAddToCart = document.getElementById('btn-product-dialog-add');
const qtyToAdd = document.getElementById('product-add-qty');
const categoryQtySpan = document.getElementById('qty-span');

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
    descP.textContent = this.truncateDescription(this.productDescription);
    const priceP = document.createElement('p');
    priceP.innerHTML = `<span>$</span>${
      this.productPrice === '999' ? 'Call for price' : this.productPrice
    }<span>$</span>`;
    priceP.classList.add('card-prod-price');
    prodInfoDiv.appendChild(descP);
    prodInfoDiv.appendChild(priceP);

    div.appendChild(h3);
    div.appendChild(catP);
    div.appendChild(imgWrapper);
    div.appendChild(prodInfoDiv);
    productsDiv.appendChild(div);
  }
  populateModalContent() {
    prodDialogTitle.innerText = '';
    prodDialogCategory.innerText = '';
    prodDialogDesc.innerText = '';
    prodDialogPrice.innerText = '';
    qtyToAdd.value = 1;
    productDialog.dataset.prodId = this.productId;
    prodDialogTitle.innerText = this.productName;
    prodDialogCategory.innerText = getProdCategory(this.categoryId);
    prodDialogImg.src = this.imageURL;
    prodDialogDesc.innerText = this.productDescription;
    prodDialogPrice.innerHTML = `<span>$</span>${this.productPrice}`;
    prodDialogInStock.innerText = `There are currently ${this.currentQty} in stock`;
  }
  truncateDescription(description) {
    const wordsArray = description.split(' ');
    const shortenedArray = wordsArray.slice(0, 14);
    shortenedArray.push('. . .');
    const shortenedDescription = shortenedArray.join(' ');
    return shortenedDescription;
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
      return 'All Products';
      break;
  }
}

// get and/or display all the products
async function getAllProducts() {
  if (!productObjects.length) {
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
    } catch (error) {
      console.log(error);
    }
  }
  // add the products to the page
  productObjects.forEach((p) => {
    p.addProductToHTML();
  });
  console.log(productObjects.length);
  categoryQtySpan.textContent = `(${productObjects.length})`;
}

const h1Elem = document.querySelector('h1');
const h2Elem = document.getElementById('cat-span');

function runH1Animation() {
  h1Elem.classList.add('h1-animation');
  setTimeout(() => {
    h1Elem.classList.remove('h1-animation');
  }, 1500);
}

// updates the h2 that shows the category of the products
function updateCardsTitle(category) {
  h2Elem.textContent = category;
}

// filter the productObjects and add them to the html
function filterProducts(categoryId) {
  productsDiv.innerHTML = '';
  console.log('category is: ' + categoryId);
  if (categoryId === 'all') {
    getAllProducts();
    return;
  }
  const filteredProducts = productObjects.filter(
    (p) => p.categoryId === parseInt(categoryId),
  );

  categoryQtySpan.textContent = `(${filteredProducts.length})`;

  filteredProducts.forEach((p) => {
    p.addProductToHTML();
  });
}

// add an item to the cart
async function handleAddItem(e) {
  const prodId = e.target.closest('dialog').dataset.prodId;
  const qty = qtyToAdd.value;
  try {
    const response = await fetch(`/products/${prodId}/inventory`);
    const data = await response.json();
    const currentQty = data.current_qty;
    if (currentQty >= qty) {
      try {
        const response = await fetch('/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: prodId,
            item_qty: qty,
          }),
        });
        const data = await response.json();
        setCartItemQty();
        productDialog.close();
      } catch (error) {
        console.log(error);
      }
    } else throw new Error('not enough in inventory to add that many');
  } catch (error) {
    console.log(error);
  }
}

btnDialogClose.addEventListener('click', () => {
  productDialog.close();
});

document.addEventListener('click', (e) => {
  // get the product id if a card was clicked
  const productCard = e.target.closest('.product-card');
  // if a select option is clicked
  const option = e.target.closest('option');

  if (productCard) {
    const prodId = productCard.dataset.prodId;
    const clickedProduct = productObjects.filter(
      (p) => p.productId === parseInt(prodId),
    );
    clickedProduct[0].populateModalContent();
    productDialog.showModal();
  }

  // runs the h1 text animation
  if (option) {
    // get the category
    const categoryId = option.value;
    const category = getProdCategory(parseInt(categoryId));
    runH1Animation();
    updateCardsTitle(category);
    filterProducts(categoryId);
  }
});

btnAddToCart.addEventListener('click', handleAddItem);

getAllProducts();

const navFirstItem = document.querySelector('nav ul li:first-child');

async function getUser() {
  try {
    const response = fetch('/user/status');
    const userData = (await response).json();
    return userData;
  } catch (error) {
    console.log(error);
  }
}

function styleLogOut() {
  navFirstItem.style.rotate = '0deg';
  navFirstItem.querySelector('p:first-child').style.margin = '0';
  // navFirstItem.querySelector('p:last-child').style.margin = '0';
  navFirstItem.style.display = 'grid';
  navFirstItem.style.placeItems = 'center';
}

function styleViewOrdersBtn() {
  const viewOrdersButton = document.getElementById('orders-link');
  viewOrdersButton.style.pointerEvents = 'auto';
  viewOrdersButton.style.opacity = '1';
}
async function isLoggedIn() {
  // if a user is logged in on page load, load appropriate UI
  try {
    const response = await getUser();
    // when i set up the endpoint, i had it return {msg: not authenticated} if not logged in
    if (!response.msg) {
      console.log('user is logged in');
      navFirstItem.innerHTML = `
        <p>Logged in as ${response.name}.</p>
        <div id="logout-cart-wrapper">
          <button id="logout-link">LOGOUT</button>
          <div id="cart-icon-wrapper">
            <a href="./checkout.html"><img id="cart-icon" src="./assets/icons/cart-yellow.png" alt="cart"/></a>
            <span></span>
          </div>
        </div>
      `;
      document
        .getElementById('logout-link')
        .addEventListener('click', handleLogout);
      styleLogOut();
      setCartItemQty();
      styleViewOrdersBtn();
      return;
    }
    console.log('user is not logged in');
    navFirstItem.innerHTML = `
            <a href="./signin.html">
              <img
                src="./assets/images/button.webp"
                alt=""
              />
            </a>
    `;
    return;
  } catch (error) {
    console.log(error);
  }
}

async function handleLogout() {
  const user = await getUser();
  const name = await user.name;
  fetch('/user/logout');
  if (user.msg) {
    alert('There is no one logged in.');
    return;
  }
  alert(`${name} is now logged out`);
  window.location.reload();
}

isLoggedIn();

async function setCartItemQty() {
  const cartQtySpan = document.querySelector('#cart-icon-wrapper span');
  try {
    const response = await fetch('/cart');
    if (!response.ok) {
      cartQtySpan.textContent = '0';
      return;
    }
    const data = await response.json();
    const qty = await data.reduce((acc, curr) => {
      return acc + curr.item_qty;
    }, 0);
    cartQtySpan.textContent = qty.toString();
  } catch (error) {
    throw new Error(error);
  }
}
