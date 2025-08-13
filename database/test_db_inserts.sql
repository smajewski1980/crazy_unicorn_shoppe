insert into
  users(name, hashed_pw, email, phone)
values
  (
    'Homer Simpson',
    'doh_nuts',
    'homer@email.com',
    '555-555-5555'
  ),
  (
    'Bruce Wayne',
    'batman_1',
    'batman@email.com',
    '222-222-2222'
  );

insert into
  user_address(
    user_id,
    address_line_1,
    city,
    state,
    zip_code
  )
values
  (
    1,
    '1342 Evergreen Terrace',
    'Springfield',
    '??',
    '12345-0000'
  ),
  (
    2,
    '47 Bat Cave Way',
    'Gotham City',
    'NY',
    '12345-0000'
  );

insert into
  products(
    product_name,
    product_description,
    product_price,
    category_id
  )
values
  (
    'Unicorn Shirt',
    'decription 1',
    14.99,
    1
  ),
  (
    'Unicorn Pants',
    'decription 2',
    24.99,
    1
  ),
  (
    'Unicorn Cookies',
    'decription 3',
    4.99,
    2
  ),
  (
    'Unicorn Phone',
    'decription 4',
    124.99,
    3
  );

insert into
  inventory(
    current_qty,
    min_qty,
    max_qty,
    product_id
  )
Values
  (10, 3, 10, 1),
  (10, 3, 10, 2),
  (30, 10, 30, 3),
  (5, 2, 5, 4);

insert into
  carts(user_id)
values
  (1),
  (2);

insert into
  cart_items(cart_id, product_id, item_qty)
values
  (1, 3, 5),
  (1, 4, 2),
  (2, 1, 2),
  (2, 2, 1);

insert into
  orders(user_id, cart_id, order_total, payment_method)
values
  (1, 1, 50, 'credit card'),
  (2, 2, 100, 'paypal');