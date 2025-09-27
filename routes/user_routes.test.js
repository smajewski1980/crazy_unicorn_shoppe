const request = require('supertest');
const superagent = require('superagent');

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

const BASE_URL = 'http://localhost:4700';

describe('user routes', () => {
  test.todo('GET routes');

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
      const agent = superagent.agent();
      await agent
        .post(BASE_URL + '/user/login')
        .send({ username: newUser.name, password: newUser.password });

      // delete the new user
      const cleanupRes = await agent.delete(`${BASE_URL}/user/${newUserId}`);
      expect(cleanupRes.statusCode).toBe(204);
    });
  });
});
