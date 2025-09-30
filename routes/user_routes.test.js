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

const badUserInput = {
  name: '',
  password: '',
  conf_password: '',
  email: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  zip_code: '',
};

const user = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

const badUser = {
  username: 'Homer Simpson',
  password: 'doh_nutsss',
};

const fullCartUser = {
  username: 'Full Cart User',
  password: 'Full Cart User',
};

const originalUser = {
  name: 'Full Cart User',
  email: 'fullcartuser@email.com',
  phone: '1-555-555-1212',
  address_line_1: '123 Main St',
  address_line_2: '',
  city: 'full cart springs',
  state: 'fu',
  zip_code: '99999',
};

const updatedUser = {
  name: 'Full Carts User',
  email: 'fullcartsuser@email.com',
  phone: '1-556-555-1212',
  address_line_1: '1234 Main St',
  address_line_2: '',
  city: 'full carts springs',
  state: 'FU',
  zip_code: '99991',
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

    test('/user/logout logs out a user', async () => {
      // logs in user
      const agent = getAgent();
      const loginRes = await agent.post(BASE_URL + '/user/login').send(user);
      expect(loginRes.statusCode).toBe(200);

      // logs out user
      const res = await agent.get(BASE_URL + '/user/logout');
      expect(res.statusCode).toBe(200);

      // checks user is logged out
      const checkRes = await agent
        .get(BASE_URL + '/user/status')
        .ok((res) => res.status === 401);
      expect(checkRes.statusCode).toBe(401);
    });

    test('/user/:id returns 403 if the id requested is not the current user', async () => {
      const agent = getAgent();
      const loginRes = await agent.post(BASE_URL + '/user/login').send(user);
      expect(loginRes.statusCode).toBe(200);

      const res = await agent
        .get(BASE_URL + '/user/47')
        .ok((res) => res.status === 403);

      expect(res.statusCode).toBe(403);
    });

    test('/user/:id returns user data', async () => {
      const agent = getAgent();
      const loginRes = await agent.post(BASE_URL + '/user/login').send(user);
      expect(loginRes.statusCode).toBe(200);

      const res = await agent.get(BASE_URL + '/user/1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
      expect(res.body.user_id).toBe(1);
    });
  });

  describe('POST routes', () => {
    test('/user/register returns 400 if password and conf password do not match', async () => {
      const pwNoMatchUser = { ...newUser };
      pwNoMatchUser.conf_password = 'something else';
      const res = await request(BASE_URL)
        .post('/user/register')
        .send(pwNoMatchUser)
        .expect(400);

      expect(res.body.msg).toBe("passwords don't match");
    });

    test('/user/register returns 400 if given invalid data', async () => {
      const res = await request(BASE_URL)
        .post('/user/register')
        .send(badUserInput)
        .expect(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
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

    test('/user/login logs in a user', async () => {
      const agent = getAgent();
      const res = await agent.post(BASE_URL + '/user/login').send(user);

      expect(res.statusCode).toBe(200);
    });

    test('/user/login return 401 if provided incorrect login credentials', async () => {
      const agent = getAgent();
      const res = await agent
        .post(BASE_URL + '/user/login')
        .send(badUser)
        .ok((res) => res.status === 401);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('put routes', () => {
    test('/user/:id returns 401 if user is not logged in', async () => {
      await request(BASE_URL).put('/user/82').send(updatedUser).expect(401);
    });

    test('/user/:id returns 400 when given bad data', async () => {
      const agent = getAgent();
      const loginRes = await agent
        .post(BASE_URL + '/user/login')
        .send(fullCartUser);
      expect(loginRes.statusCode).toBe(200);

      const res = await agent
        .put(BASE_URL + '/user/82')
        .send(badUserInput)
        .ok((res) => res.status === 400);
      expect(res.statusCode).toBe(400);
    });

    test('/user/:id returns 201 and updates user data', async () => {
      // login the user
      const agent = getAgent();
      const loginRes = await agent
        .post(BASE_URL + '/user/login')
        .send(fullCartUser);
      expect(loginRes.statusCode).toBe(200);

      // update the user info
      const updateRes = await agent
        .put(BASE_URL + '/user/82')
        .send(updatedUser);
      expect(updateRes.statusCode).toBe(201);

      // confirm it was updated
      const checkRes = await agent.get(BASE_URL + '/user/82');
      expect(checkRes.body.name).toBe(updatedUser.name);
      expect(checkRes.body.email).toBe(updatedUser.email);
      expect(checkRes.body.phone).toBe(updatedUser.phone);

      // revert the user info back
      const cleanupRes = await agent
        .put(BASE_URL + '/user/82')
        .send(originalUser);
      expect(cleanupRes.statusCode).toBe(201);
    });
  });
});
