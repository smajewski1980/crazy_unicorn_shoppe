const request = require('supertest');
const superagent = require('superagent');
const { body } = require('express-validator');

const newUser = {
  name: 'Test Run User',
  password: 'Test Run User',
  conf_password: 'Test Run User',
  email: 'testrunuser@email.com',
  phone: '1-555-555-1212',
  address_line_1: '123 Main St.',
  address_line_2: '',
  city: 'Bangor',
  state: 'ME',
  zip_code: '99999',
};

const user = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

const BASE_URL = 'http://localhost:4700';

const getAgent = () => superagent.agent();

describe('user routes', () => {
  describe('GET routes', () => {
    test('user/status returns 401 if not logged in', async () => {
      await request(BASE_URL).get('/user/status').expect(401);
    });
    test('user/status returns the user obj when logged in', async () => {
      const agent = getAgent();
      await agent.post(BASE_URL + '/user/login').send(user);

      const res = await agent.get(BASE_URL + '/user/status');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
      expect(res.body.name).toBe(user.username);
    });
  });

  describe('POST routes', () => {
    test('/user/register returns 400 if password and conf password do not match', async () => {
      const pwNoMatchUser = { ...newUser };
      pwNoMatchUser.conf_password = 'something else';
      await request(BASE_URL)
        .post('/user/register')
        .send(pwNoMatchUser)
        .expect(400);
    });

    test('/user/register returns 201 when given valid data', async () => {
      // register a new user
      const res = await request(BASE_URL)
        .post('/user/register')
        .send(newUser)
        .expect(201);

      const newUserId = res.body.user_id;

      // login the new user
      const agent = getAgent();
      await agent
        .post(BASE_URL + '/user/login')
        .send({ username: newUser.name, password: newUser.password });

      // delete the new user
      const cleanupRes = await agent.delete(`${BASE_URL}/user/${newUserId}`);
      expect(cleanupRes.statusCode).toBe(204);
    });
  });
});
