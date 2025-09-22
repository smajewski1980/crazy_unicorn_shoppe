const request = require('supertest');

test('get all products', async () => {
  await request('localhost:4700')
    .get('/products')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');
});
