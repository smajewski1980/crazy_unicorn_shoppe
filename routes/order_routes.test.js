const request = require('supertest');
const superagent = require('superagent');

describe('GET endpoints', () => {
  describe('/order/:id', () => {
    test.todo('returns 401 if not auth');
    test.todo(
      'returns 404 error message: We could not find a order with that id. if given a bad id',
    );
    test.todo(
      "returns 401 error message: Mind your business, that is someone else's order id! if :id is not of the logged in user",
    );
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
