const request = require('supertest');
const superagent = require('superagent');

const testLogin = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

// walk before we run
// the 'GET' tests

test('get all products', async () => {
  const res = await request('localhost:4700')
    .get('/products')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');

  expect(Object.keys(res.body).length).toBeTruthy();
});

test('get a product by id', async () => {
  const res = await request('localhost:4700')
    .get('/products/1')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');

  expect(res.body.product_id).toBe(1);
});

test('get a products inventory by its id', async () => {
  const res = await request('localhost:4700')
    .get('/products/1/inventory')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');

  expect(Object.keys(res.body).length).toBe(3);
});

// test a non happy path
test('get a products inventory by its id, provided a bad id', async () => {
  const res = await request('localhost:4700')
    .get('/products/999/inventory')
    .expect(404)
    .expect('Content-Type', 'application/json; charset=utf-8');

  expect(res.body).toBe('We could not find a product with that id.');
});

test('get products by category', async () => {
  const res = await request('localhost:4700')
    .get('/products/category/1')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');

  expect(Object.keys(res.body).length).toBeGreaterThan(0);
});

// another non happy path
test('return an error if given a bad category id', async () => {
  const res = await request('localhost:4700')
    .get('/products/category/9')
    .expect(404);

  expect(res.body).toBe('We could not find a category with that id.');
});

describe('add product endpoint', () => {
  let agent;

  beforeAll(async () => {
    agent = superagent.agent();
    await agent.post('http://localhost:4700/user/login').send(testLogin);
  });

  test('returns a 400 if given bad product data', () => {
    const data = { wrongField: 'wrong data' };
    agent
      .post('http://localhost:4700/products')
      .send(data)
      .end((err, res) => {
        expect(res.statusCode).toBe(400);
      });
  });

  test('adds a product to the products table in the db', async () => {
    const input = {
      product_name: 'test_product_47',
      product_description: 'blah blah heres some text',
      product_price: 47,
      image_url: './assets/path_to_file.webp',
      category_id: 3,
      current_qty: 5,
      min_qty: 6,
      max_qty: 7,
    };
    const res = await agent.post('http://localhost:4700/products').send(input);
    const newId = res.body.id;
    expect(res.statusCode).toBe(201);

    // the above added the test product to the database
    // the below removes it
    const delRes = await agent.delete(
      `http://localhost:4700/products/${newId}`,
    );
    expect(delRes.statusCode).toBe(204);
  });
});
