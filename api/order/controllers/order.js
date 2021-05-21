'use strict';

const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET)

module.exports = {
  async create(ctx) {
    const { token, products, idUser, addressShipping } = ctx.request.body

    let totalPayment = 0

    products.forEach((product) => {
      totalPayment = totalPayment + product.price - Math.floor(product.price * product.discount) / 100
    })

    const charge = await stripe.charges.create({
      amount: totalPayment * 100,
      currency: 'BRL',
      source: token.id,
      description: `Id Usuário: ${idUser}`
    })

    const createOrder = []
    for await (const product of products) {
      const data = {
        game: product.id,
        user: idUser,
        totalPayment,
        idPayment: charge.id,
        addressShipping
      }

      const validData = await strapi.entityValidator.validateEntityCreation(
        strapi.models.order,
        data
      )

      const entry = await strapi.query('order').create(validData)

      createOrder.push(entry)
    }

    return createOrder

  }
};
