const request = require('supertest');
const superagent = require('superagent');

const BASE_URL = 'http://localhost:4700';

const goodUser = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

const getAgent = () => superagent.agent();

async function logIn(agent) {
  const loginRes = await agent.post(BASE_URL + '/user/login').send(goodUser);
  return loginRes.statusCode;
}

describe('GET endpoints', () => {
  describe('/order/:id', () => {
    test('returns 401 if not auth', async () => {
      const res = await request(BASE_URL).get('/order/47');
      expect(res.statusCode).toBe(401);
    });

    test('returns 404 error message: We could not find a order with that id. if given a bad id', async () => {
      const agent = getAgent();
      expect(await logIn(agent)).toBe(200);

      const res = await agent
        .get(BASE_URL + '/order/99999')
        .ok((res) => res.statusCode === 404);
      expect(res.statusCode).toBe(404);
      expect(res.error.text).toBe('"We could not find a order with that id."');
    });

    test("returns 401 error message: Mind your business, that is someone else's order id! if :id is not of the logged in user", async () => {
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
    test.todo('returns order data when provided a valid order id');
  });

  describe('/order/:id/all', () => {
    test.todo('returns 401 if not auth');
    test.todo('returns all orders when provide a valid user id');
    test.todo(
      'returns 404 err msg: We could not find any orders for that user. if user has no orders',
    );
    test.todo(
      "returns 401 error message: Mind your business, that is someone else's order id! if :id is not of the logged in user",
    );
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
