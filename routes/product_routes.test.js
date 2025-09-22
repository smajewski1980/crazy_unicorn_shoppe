const request = require('supertest');

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
test('get a products inventory by its id, provided a bad one', async () => {
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
