const request = require('supertest');
const superagent = require('superagent');

const testLogin = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};
const emptyCartUser = {
  username: 'Empty Cart User',
  password: 'Empty Cart User',
};
const fullCartUser = {
  username: 'Full Cart User',
  password: 'Full Cart User',
};
const product = { product_id: 2, item_qty: 1 };

describe('cart_routes', () => {
  describe('the GET endpoints', () => {
    test('returns 401 if not logged in', async () => {
      await request('localhost:4700').get('/cart').expect(401);
    });

    test('returns 400 if the user has an empty cart', async () => {
      const agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(emptyCartUser);

      const res = await agent
        .get('http://localhost:4700/cart')
        .ok((res) => res.status === 400)
        .then((res) => res);

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe('Thats one empty cart you got there!');
    });

    test('returns user cart data', async () => {
      const agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(fullCartUser);

      const res = await agent.get('http://localhost:4700/cart');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    });

    test('returns 401 if not logged in', async () => {
      await request('localhost:4700').post('/cart/checkout').expect(401);
    });

    test('gets the users checkout data', async () => {
      const agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(fullCartUser);

      const res = await agent.get('http://localhost:4700/cart/checkout');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    });
  });

  describe('the post endpoints', () => {
    test('returns 401 if not logged in', async () => {
      await request('localhost:4700').post('/cart').expect(401);
    });

    test('adds a product to the cart', async () => {
      // in the cleanup, this test also tests the DELETE /cart endpoint
      const agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(fullCartUser);

      // add a product to the cart
      const res = await agent.post('http://localhost:4700/cart').send(product);

      expect(res.statusCode).toBe(200);
      expect(res.body.product_name).toBe(product.productName);
      expect(res.body.item_qty).toBe(product.item_qty);

      // remove the added item from the cart
      const cleanupRes = await agent.delete(
        `http://localhost:4700/cart/${product.product_id}`,
      );

      expect(cleanupRes.statusCode).toBe(204);
    });

    test('returns 200 or 400 when "payment" is submitted', async () => {
      // for fun, i have the payment occasionally get rejected, thats why the test is for 400 or 200
      const agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(fullCartUser);

      const res = await agent
        .post('http://localhost:4700/cart/checkout')
        .ok((res) => res.status === 400 || 200);

      expect(res.statusCode === 200 || res.statusCode === 400).toBe(true);
    });
  });
});
