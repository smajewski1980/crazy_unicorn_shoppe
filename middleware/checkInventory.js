module.exports = async function checkInventory(req, res, next) {
  const { product_id, item_qty } = req.body;

  // see if this products inventory is greater than the requested item_qty
  try {
    const response = await fetch(`/products/${product_id}/inventory`);
    const data = await response.json();
    const currentQty = data.current_qty;
    console.log(currentQty);
    next();
  } catch (error) {
    next(error);
  }
};
