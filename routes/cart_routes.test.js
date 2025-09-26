const request = require('supertest');
const superagent = require('superagent');

const emptyCartUser = {
  username: 'Empty Cart User',
  password: 'Empty Cart User',
};

const fullCartUser = {
  username: 'Full Cart User',
  password: 'Full Cart User',
};

const product = { product_id: 2, item_qty: 1 };
const updatedProduct = { product_id: 2, item_qty: 5 };

const testForNotLoggedIn = (verb) => {
  test('returns 401 if not logged in', async () => {
    await request('localhost:4700')[verb]('/cart').expect(401);
  });
};

const getAgent = () => superagent.agent();

const loginUser = async (agent, user) =>
  await agent.post('http://localhost:4700/user/login').send(user);

describe('cart_routes', () => {
  const BASE_URL = 'http://localhost:4700/cart';

  describe('the GET endpoints', () => {
    testForNotLoggedIn('get');

    test('returns 400 if the user has an empty cart', async () => {
      const agent = getAgent();
      await loginUser(agent, emptyCartUser);

      const res = await agent
        .get(BASE_URL)
        .ok((res) => res.status === 400)
        .then((res) => res);

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe('Thats one empty cart you got there!');
    });

    test('returns user cart data', async () => {
      const agent = getAgent();
      await loginUser(agent, fullCartUser);

      const res = await agent.get(BASE_URL);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    });

    test('gets the users checkout data', async () => {
      const agent = getAgent();
      await loginUser(agent, fullCartUser);

      const res = await agent.get(BASE_URL + '/checkout');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    });
  });

  describe('the post endpoints', () => {
    testForNotLoggedIn('post');

    let agent;
    beforeEach(async () => {
      agent = getAgent();
      await loginUser(agent, fullCartUser);
    });

    test('adds a product to the cart', async () => {
      // add a product to the cart
      const res = await agent.post(BASE_URL).send(product);

      expect(res.statusCode).toBe(200);
      expect(res.body.product_name).toBe(product.productName);
      expect(res.body.item_qty).toBe(product.item_qty);

      // remove the added product from the cart
      const cleanupRes = await agent.delete(
        `${BASE_URL}/${product.product_id}`,
      );

      expect(cleanupRes.statusCode).toBe(204);
    });

    test('returns 200 or 400 when "payment" is submitted', async () => {
      // for fun, i have the payment occasionally get rejected, thats why the test is for 400 or 200

      const res = await agent
        .post(BASE_URL + '/checkout')
        .ok((res) => res.status === 400 || 200);

      expect(res.statusCode === 200 || res.statusCode === 400).toBe(true);
    });
  });

  describe('PUT endpoint', () => {
    testForNotLoggedIn('put');

    test('updates the qty of an item in the cart', async () => {
      // login a user
      const agent = getAgent();
      await loginUser(agent, fullCartUser);

      // add a product to the cart that we can then update
      const addRes = await agent.post(BASE_URL).send(product);

      expect(addRes.statusCode).toBe(200);
      expect(addRes.body.product_id).toBe(product.product_id);
      expect(addRes.body.item_qty).toBe(product.item_qty);

      // update the item_qty of the item we just added
      const res = await agent.put(BASE_URL).send(updatedProduct);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].product_id).toBe(updatedProduct.product_id);
      expect(res.body[0].item_qty).toBe(updatedProduct.item_qty);

      // remove the added item from the cart
      const cleanupRes = await agent.delete(
        `${BASE_URL}/${product.product_id}`,
      );

      expect(cleanupRes.statusCode).toBe(204);
    });
  });
});
