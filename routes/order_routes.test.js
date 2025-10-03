const request = require('supertest');
const superagent = require('superagent');

const BASE_URL = 'http://localhost:4700';

const goodUser = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

const emptyCartUser = {
  username: 'Empty Cart User',
  password: 'Empty Cart User',
};

const multiOrderTestUser = {
  username: 'multi order user for testing',
  password: 'multi order',
};

const getAgent = () => superagent.agent();

async function logIn(agent) {
  const loginRes = await agent.post(BASE_URL + '/user/login').send(goodUser);
  return loginRes.statusCode;
}

const homerOrder2 = {
  order_id: 75,
  user_id: 1,
  order_date: `${new Date('2025-09-02 20:37:48.715901-04').toISOString()}`,
  order_total: '4.75',
  order_status: 'canceled',
  payment_method: 'pretend-pal',
  free_shipping_elligible: false,
  cart_id: 78,
  order_items: [
    {
      cart_id: 78,
      item_qty: 1,
      item_subtotal: '4',
      product_name: 'Unicorn Cupcake',
      product_price: '4',
    },
  ],
};

describe('GET endpoints', () => {
  describe('/order/:id', () => {
    test('returns 401 if not auth', async () => {
      await request(BASE_URL).get('/order/47').expect(401);
    });

    test('returns 404 error message if given a bad id', async () => {
      const agent = getAgent();
      expect(await logIn(agent)).toBe(200);

      const res = await agent
        .get(BASE_URL + '/order/99999')
        .ok((res) => res.statusCode === 404);
      expect(res.statusCode).toBe(404);
      expect(res.error.text).toBe('"We could not find a order with that id."');
    });

    test('returns 401 error message if :id is not of the logged in user', async () => {
      const agent = getAgent();
      expect(await logIn(agent)).toBe(200);

      const res = await agent
        .get(BASE_URL + '/order/2')
        .ok((res) => res.statusCode === 401);
      expect(res.statusCode).toBe(401);
      expect(res.error.text).toBe(
        '"Mind your business, that is someone else\'s order id!"',
      );
    });
    test('returns order data when provided a valid order id', async () => {
      const agent = getAgent();
      expect(await logIn(agent)).toBe(200);

      const res = await agent.get(BASE_URL + '/order/75');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
      expect(res.body).toEqual(homerOrder2);
    });
  });

  describe('/order/:id/all', () => {
    test('returns 401 if not auth', async () => {
      await request(BASE_URL).get('/order/1/all').expect(401);
    });

    test('returns 404 error if user has no orders', async () => {
      const agent = getAgent();
      const loginRes = await agent
        .post(BASE_URL + '/user/login')
        .send(emptyCartUser);
      expect(loginRes.statusCode).toBe(200);

      const res = await agent
        .get(BASE_URL + '/order/81/all')
        .ok((res) => res.statusCode === 404);
      expect(res.statusCode).toBe(404);
      expect(res.error.text).toBe(
        '"We could not find any orders for that user."',
      );
    });

    test('returns 401 error if :id is not of the logged in user', async () => {
      const agent = getAgent();
      expect(await logIn(agent)).toBe(200);

      const res = await agent
        .get(BASE_URL + '/order/2/all')
        .ok((res) => res.statusCode === 401);
      expect(res.statusCode).toBe(401);
      expect(res.error.text).toBe(
        '"Mind your business, that\'s not your order!"',
      );
    });

    test('returns all orders for a user when provide a valid user id', async () => {
      const agent = getAgent();
      const loginRes = await agent
        .post(BASE_URL + '/user/login')
        .send(multiOrderTestUser);
      expect(loginRes.statusCode).toBe(200);

      const res = await agent.get(BASE_URL + '/order/422/all');
      expect(res.ok).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });
});

describe('POST endpoints', () => {
  describe('/order', () => {
    test.todo('returns 401 if user not auth');
    test.todo(
      'creates an order and adjusts the respective product inventories',
    );
  });
});

describe('PUT endpoints', () => {
  test.todo('returns 401 if not auth');
  test.todo(
    'returns 404 error message: We could not find a order with that id. if given a bad id',
  );
  test.todo(
    "returns 401 error message: Mind your business, that is someone else's order id! if :id is not of the logged in user",
  );
  test.todo('updates order status');
});

describe('DELETE /order/:id endpoint', () => {
  test.todo('returns 401 if not auth');
  test.todo(
    'returns 404 error message: We could not find a order with that id. if given a bad id',
  );
  test.todo(
    "returns 401 error message: Mind your business, that is someone else's order id! if :id is not of the logged in user",
  );
  test.todo('cancels an order when given a valid order id');
});
