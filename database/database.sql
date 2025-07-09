DROP TABLE IF EXISTS category CASCADE;

CREATE TABLE category(
  category_id serial PRIMARY KEY,
  category_name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  user_id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  hashed_pw varchar(255) NOT NULL,
  email varchar(100) NOT NULL,
  phone varchar(12)
);

DROP TABLE IF EXISTS user_address CASCADE;

CREATE TABLE user_address(
  user_id int,
  address_line_1 varchar(50) NOT NULL,
  address_line_2 varchar(50),
  city varchar(50) NOT NULL,
  state varchar(50) NOT NULL,
  zip_code varchar(10) NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders(
  order_id serial PRIMARY KEY,
  user_id integer REFERENCES users(user_id) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  order_total DECIMAL NOT NULL,
  order_status varchar(50) NOT NULL,
  payment_method varchar(50) NOT NULL,
  free_shipping_elligible boolean GENERATED ALWAYS AS (order_total > 99) STORED NOT NULL
);

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products(
  product_id serial PRIMARY KEY,
  product_name varchar(100) NOT NULL,
  product_description varchar(255) NOT NULL,
  product_price DECIMAL NOT NULL,
  image_url varchar(255),
  category_id integer REFERENCES category(category_id) NOT NULL
);

DROP TABLE IF EXISTS inventory CASCADE;

CREATE TABLE inventory(
  product_id integer,
  current_qty integer NOT NULL,
  min_qty integer NOT NULL,
  max_qty integer NOT NULL,
  PRIMARY KEY (product_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- originally the above did not include ON DELETE CASCADE on the fkey
-- so i did this in a pg admin query
-- BEGIN;
-- ALTER TABLE inventory DROP CONSTRAINT inventory_product_id_fkey;
-- ALTER TABLE inventory ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES PRODUCTS (product_id) ON DELETE CASCADE;
-- COMMIT;
--
DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE order_items(
  order_id integer REFERENCES orders(order_id) NOT NULL,
  product_id integer REFERENCES products(product_id) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  qty integer NOT NULL
);

DROP TABLE IF EXISTS carts CASCADE;

CREATE TABLE carts(
  cart_id serial PRIMARY KEY,
  user_id integer REFERENCES users(user_id) NOT NULL,
  is_active boolean DEFAULT true
);

ALTER TABLE
  orders
ADD
  COLUMN cart_id integer;

ALTER TABLE
  orders
ADD
  CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES carts(cart_id);

DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items(
  cart_id integer REFERENCES carts(cart_id),
  product_id integer REFERENCES products(product_id),
  PRIMARY KEY(cart_id, product_id),
  item_qty integer NOT NULL
);

-- **************************************************************
insert into
  category(category_name)
values
  ('Clothing'),
  ('Food'),
  ('Electronics'),
  ('Furniture'),
  ('Vehicles'),
  ('Miscellaneous Crazy');

select
  *
from
  category;

--********* 
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
    'This will be a descriptive Peterman style decription',
    14.99,
    1
  ),
  (
    'Unicorn Pants',
    'This will be a descriptive Peterman style decription',
    24.99,
    1
  ),
  (
    'Unicorn Cookies',
    'This will be a descriptive Peterman style decription',
    4.99,
    2
  ),
  (
    'Unicorn Phone',
    'This will be a descriptive Peterman style decription',
    124.99,
    3
  );

select
  *
from
  products;

--********* 
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

select
  *
from
  inventory;

--*********
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

select
  *
from
  users;

-- ***********
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

select
  *
from
  user_address;

-- ****************************
insert into
  orders(user_id, order_total, payment_method)
values
  (1, 50, 'credit card'),
  (2, 100, 'paypal');

select
  *
from
  orders;

-- *************************
insert into
  carts(user_id)
values
  (1),
  (2);

select
  *
from
  carts;

-- ******************************
insert into
  cart_items(cart_id, product_id, item_qty)
values
  (1, 3, 5),
  (1, 4, 2),
  (2, 1, 2),
  (2, 2, 1);

select
  *
from
  cart_items;