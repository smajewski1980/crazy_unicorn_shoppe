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

const createOrderUser = {
  username: 'create order user for testing',
  password: 'createorder',
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

// const createOrderObj = {
//   user_id: 480,
//   order_total
// }

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
    test('returns 401 if user not auth', async () => {
      await request(BASE_URL).post('/order').expect(401);
    });

    // this one is goin to take a lot of setup and teardown
    test('creates an order and adjusts the respective product inventories', async () => {
      const addToCartURL = 'http://localhost:4700/cart';
      const product = { product_id: 2, item_qty: 1 };

      const agent = getAgent();
      const loginRes = await agent
        .post(BASE_URL + '/user/login')
        .send(createOrderUser);
      expect(loginRes.ok).toBe(true);

      // add something to the cart
      const addRes = await agent.post(addToCartURL).send(product); // <------------- left off here
      expect(addRes.statusCode).toBe(200);
      expect(addRes.body.product_name).toBe(product.productName);
      expect(addRes.body.item_qty).toBe(product.item_qty);

      // get the inventory of the item(s) added to the cart
      const startInvRes = await request(BASE_URL)
        .get(`/products/${product.product_id}/inventory`)
        .expect(200);
      const startQty = await startInvRes.body.current_qty;

      // create the order
      const checkoutRes = await agent.get(BASE_URL + '/cart/checkout');
      const subtotal =
        checkoutRes.body[0].item_qty * checkoutRes.body[0].product_price;
      const subPlusShipping = subtotal + subtotal * 0.1;
      const subPlusTax = subPlusShipping + subPlusShipping * 0.08;
      const newOrderObj = {
        user_id: checkoutRes.body[0].user_id,
        order_total: subPlusTax,
        payment_method: 'pretend-pal',
        cart_id: checkoutRes.body[0].cart_id,
      };
      const createOrderRes = await agent
        .post(BASE_URL + '/order')
        .send(newOrderObj);
      expect(createOrderRes.ok).toBe(true);
      expect(createOrderRes.body.msg).toBe('order created');
      const createdOrderId = createOrderRes.body.order_id;

      // cancel the order - this is also the test for the delete endpoint
      const cancelOrderRes = await agent.delete(
        `${BASE_URL}/order/${createdOrderId}`,
      );
      expect(cancelOrderRes.ok).toBe(true);
      expect(cancelOrderRes.body.msg).toBe(
        'The order has been successfully canceled.',
      );
      expect(cancelOrderRes.body.order_status).toBe('canceled');

      // compare now inventory to start inventory
      const endInvRes = await request(BASE_URL)
        .get(`/products/${product.product_id}/inventory`)
        .expect(200);
      expect(endInvRes.body.current_qty).toBe(startQty);
    });
  });
});

describe('PUT /order/:id endpoints', () => {
  test('returns 401 if user not auth', async () => {
    await request(BASE_URL).put('/order/1').expect(401);
  });

  test('returns 404 error if given a bad id', async () => {
    const agent = getAgent();
    expect(await logIn(agent)).toBe(200);

    const res = await agent
      .put(BASE_URL + '/order/999999')
      .send({ updatedOrderStatus: 'canceled' })
      .ok((res) => res.statusCode === 404);
    expect(res.statusCode).toBe(404);
    expect(res.error.text).toBe('"We could not find an order with that id."');
  });

  test('returns 401 error if :id is not of the logged in user', async () => {
    const agent = getAgent();
    expect(await logIn(agent)).toBe(200);

    const res = await agent
      .put(BASE_URL + '/order/80')
      .send({ updatedOrderStatus: 'canceled' })
      .ok((res) => res.statusCode === 401);
    expect(res.statusCode).toBe(401);
    expect(res.error.text).toBe(
      '"Mind your business, that is someone else\'s order id!"',
    );
  });

  test('updates order status', async () => {
    const agent = getAgent();
    const loginRes = await agent
      .post(BASE_URL + '/user/login')
      .send(createOrderUser);
    expect(loginRes.ok).toBe(true);

    const updateRes = await agent
      .put(BASE_URL + '/order/100')
      .send({ updatedOrderStatus: 'pending' });
    expect(updateRes.ok).toBe(true);
    expect(updateRes.body.msg).toBe('order status has been updated');
    expect(updateRes.body.order_status).toBe('pending');

    const cleanupRes = await agent
      .put(BASE_URL + '/order/100')
      .send({ updatedOrderStatus: 'canceled' });
    expect(cleanupRes.ok).toBe(true);
    expect(cleanupRes.body.msg).toBe('order status has been updated');
    expect(cleanupRes.body.order_status).toBe('canceled');
  });
});

describe('DELETE /order/:id endpoint', () => {
  test('returns 401 if not auth', async () => {
    await request(BASE_URL).put('/order/1').expect(401);
  });

  test('returns 404 error if given a bad id', async () => {
    const agent = getAgent();
    expect(await logIn(agent)).toBe(200);

    const res = await agent
      .delete(BASE_URL + '/order/999999')
      .ok((res) => res.statusCode === 404);
    expect(res.statusCode).toBe(404);
    expect(res.error.text).toBe('"We could not find an order with that id."');
  });

  test('returns 401 error if :id is not of the logged in user', async () => {
    const agent = getAgent();
    expect(await logIn(agent)).toBe(200);

    const res = await agent
      .delete(BASE_URL + '/order/80')
      .ok((res) => res.statusCode === 401);
    expect(res.statusCode).toBe(401);
    expect(res.error.text).toBe(
      '"Mind your business, that is someone else\'s order id!"',
    );
  });

  // the happy path was tested in the teardown for the create order test above
});
