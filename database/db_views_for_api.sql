CREATE
OR REPLACE VIEW cart_items_with_names AS
SELECT
  c.cart_id,
  p.product_name,
  ci.item_qty,
  c.user_id
FROM
  carts c
  JOIN cart_items ci ON ci.cart_id = c.cart_id
  JOIN products p ON p.product_id = ci.product_id
WHERE
  c.is_active = true;

-- *************************************************
CREATE
OR REPLACE VIEW data_to_checkout AS
SELECT
  c.cart_id,
  c.user_id,
  p.product_name,
  ci.item_qty,
  p.product_price,
  p.product_id
FROM
  carts c
  JOIN cart_items ci ON ci.cart_id = c.cart_id
  JOIN products p ON p.product_id = ci.product_id
WHERE
  c.is_active = true
ORDER BY
  c.cart_id,
  p.product_name;

-- ************************************************
CREATE
OR REPLACE VIEW get_all_orders AS
SELECT
  o.order_id,
  o.user_id,
  o.order_date,
  o.order_total,
  o.order_status,
  o.payment_method,
  o.free_shipping_elligible,
  o.cart_id,
  p.product_name,
  p.product_price,
  ci.item_qty,
  p.product_price * ci.item_qty :: numeric AS subtotal
FROM
  orders o
  JOIN cart_items ci ON ci.cart_id = o.cart_id
  JOIN products p ON ci.product_id = p.product_id;

-- ****************************************************
CREATE
OR REPLACE VIEW order_items_lookup AS
SELECT
  ci.cart_id,
  p.product_name,
  p.product_price,
  ci.item_qty,
  p.product_price * ci.item_qty :: numeric AS item_subtotal
FROM
  cart_items ci
  JOIN products p ON p.product_id = ci.product_id;

-- *****************************************************
CREATE
OR REPLACE VIEW summerized_orders_list AS
SELECT
  order_id,
  user_id,
  order_date,
  order_total,
  payment_method,
  cart_id,
  order_status
FROM
  orders
ORDER BY
  order_date DESC;

-- *************************************************************
CREATE
OR REPLACE VIEW get_all_products AS
SELECT
  p.*,
  i.current_qty,
  i.min_qty,
  i.max_qty
FROM
  products AS p
  JOIN inventory AS i ON p.product_id = i.product_id
ORDER BY
  product_name;

-- ****************************************************************
CREATE
OR REPLACE VIEW get_user_info AS
SELECT
  u.*,
  ua.address_line_1,
  ua.address_line_2,
  ua.city,
  ua.state,
  ua.zip_code
FROM
  users AS u
  JOIN user_address AS ua ON u.user_id = ua.user_id;

-- *****************************************************************
CREATE
OR REPLACE VIEW curr_site_hit_count AS
SELECT
  count
FROM
  site_counter
ORDER BY
  count DESC
LIMIT
  1;

--******************************************************************