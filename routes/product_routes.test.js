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
