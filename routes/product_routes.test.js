const request = require('supertest');
const superagent = require('superagent');

const testLogin = {
  username: 'Homer Simpson',
  password: 'doh_nuts',
};

const productInput = {
  product_name: 'test_product_47',
  product_description: 'blah blah heres some text',
  product_price: 47,
  image_url: './assets/path_to_file.webp',
  category_id: 3,
  current_qty: 5,
  min_qty: 6,
  max_qty: 7,
};
describe('product_routes', () => {
  // walk before we run
  // the 'GET' tests
  describe('test the get endpoints', () => {
    test('get all products', async () => {
      const res = await request('localhost:4700')
        .get('/products')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(Object.keys(res.body).length).toBeTruthy();
    });

    test('get a product by id', async () => {
      const res = await request('localhost:4700')
        .get('/products/1')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(res.body.product_id).toBe(1);
    });

    test('get a products inventory by its id', async () => {
      const res = await request('localhost:4700')
        .get('/products/1/inventory')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(Object.keys(res.body).length).toBe(3);
    });

    // test a non happy path
    test('returns 404 when provided a bad product id', async () => {
      const res = await request('localhost:4700')
        .get('/products/999/inventory')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(res.body).toBe('We could not find a product with that id.');
    });

    test('get products by category', async () => {
      const res = await request('localhost:4700')
        .get('/products/category/1')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(Object.keys(res.body).length).toBeGreaterThan(0);
    });

    // another non happy path
    test('return an error if given a bad category id', async () => {
      const res = await request('localhost:4700')
        .get('/products/category/9')
        .expect(404);

      expect(res.body).toBe('We could not find a category with that id.');
    });
  });

  // the tests that require being logged in
  describe('endpoints that need auth', () => {
    let agent;

    //  login, the agent hold my session data
    beforeAll(async () => {
      agent = superagent.agent();
      await agent.post('http://localhost:4700/user/login').send(testLogin);
    });

    // some helper functions
    async function addProduct() {
      const res = await agent
        .post('http://localhost:4700/products')
        .send(productInput);
      const newId = res.body.id;
      expect(res.statusCode).toBe(201);
      return newId;
    }
    // this helper function is also a test for the DELETE /products/:id endpoint
    async function deleteProduct(id) {
      const delRes = await agent.delete(`http://localhost:4700/products/${id}`);
      expect(delRes.statusCode).toBe(204);
    }

    test('add products returns a 400 if given bad product data', () => {
      const data = { wrongField: 'wrong data' };
      agent
        .post('http://localhost:4700/products')
        .send(data)
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
        });
    });

    test('adds a product to the products table in the db', async () => {
      const newId = await addProduct();

      deleteProduct(newId);
    });

    test('updates product info ', async () => {
      // add a product and get it's id to work with
      const newId = await addProduct();

      // duplicate the product input and make a change to it
      const updatedProductInput = { ...productInput };
      updatedProductInput.product_name = 'updated name 47';

      // update the product we added
      const res = await agent
        .put(`http://localhost:4700/products/${newId}`)
        .send(updatedProductInput);

      // expect the update was successful
      expect(res.statusCode).toBe(200);
      expect(res.body.product_id).toBe(newId);

      // get the updated product and check the updated field
      const res2 = await agent.get(`http://localhost:4700/products/${newId}`);
      expect(res2.body.product_name).toBe(updatedProductInput.product_name);

      // clean up
      deleteProduct(newId);
    });

    test('updates product inventory', async () => {
      const updatedQty = { current_qty: 47 };
      // add a product and get it's id to work with
      const newId = await addProduct();

      // update the products qty
      const res = await agent
        .put(`http://localhost:4700/products/${newId}/inventory`)
        .send(updatedQty);

      expect(res.statusCode).toBe(200);
      expect(res.body.product_id).toBe(newId.toString());

      // get the products inventory to test it was updated
      const getInvRes = await agent.get(
        `http://localhost:4700/products/${newId}/inventory`,
      );

      expect(getInvRes.statusCode).toBe(200);
      expect(getInvRes.body.current_qty).toBe(updatedQty.current_qty);

      // clean up
      deleteProduct(newId);
    });
  });
});
