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
  email varchar(100) UNIQUE NOT NULL,
  phone varchar(14),
  is_admin boolean DEFAULT false
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
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products(
  product_id serial PRIMARY KEY,
  product_name varchar(100) NOT NULL,
  product_description TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
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

DROP TABLE IF EXISTS carts CASCADE;

CREATE TABLE carts(
  cart_id serial PRIMARY KEY,
  user_id integer REFERENCES users(user_id) NOT NULL,
  is_active boolean DEFAULT true
);

DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items(
  cart_id integer REFERENCES carts(cart_id) ON DELETE CASCADE,
  product_id integer REFERENCES products(product_id),
  PRIMARY KEY(cart_id, product_id),
  item_qty integer NOT NULL
);

DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders(
  order_id serial PRIMARY KEY,
  user_id integer REFERENCES users(user_id) NOT NULL,
  cart_id integer REFERENCES carts(cart_id) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  order_total NUMERIC NOT NULL,
  order_status varchar(50) DEFAULT 'pending' NOT NULL,
  payment_method varchar(50) NOT NULL,
  free_shipping_elligible boolean GENERATED ALWAYS AS (order_total > 99) STORED NOT NULL
);

insert into
  category(category_name)
values
  ('Food & Beverage'),
  ('Fashion and Accessories'),
  ('Electronics'),
  ('Home Decor'),
  ('Gifts and Gadgets of Crazy');