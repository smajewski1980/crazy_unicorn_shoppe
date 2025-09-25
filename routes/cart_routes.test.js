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

describe('cart_routes', () => {
  describe('endpoints that need auth', () => {
    describe('the GET endpoints', () => {
      test('returns 401 if not logged in', async () => {
        await request('localhost:4700').get('/cart').expect(401);
      });

      test('returns 400 if the user has an empty cart', async () => {
        const agent = superagent.agent();
        await agent
          .post('http://localhost:4700/user/login')
          .send(emptyCartUser);

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
    });
  });
});
