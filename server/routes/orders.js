const express = require('express')
const router = express.Router()

const { database } = require('../config/helpers')


//OBTENER TODAS LAS ORDENES
router.get('/', (req, res) => {
    database.table('orders_details as od')
    .join([
        {
            table: 'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table: 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
    .sort({id: 1})
    .getAll()
    .then(orders => {
        if(orders.length > 0){
            res.json(orders)
        } else{
            res.json({message: "No orders found"});
        }

    }).catch(err => res.json(err))
})



//OBTENER UNA ORDEN
router.get('/:id', (req, res) => {

    const orderId = request.params.id

    database.table('orders_details as od')
    .join([
        {
            table: 'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table: 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
    .filter({'o.id': orderId})
    .getAll()
    .then(orders => {
        if(orders.length > 0){
            res.json(orders)
        } else{
            res.json({message: `No orders found with this orderId: ${orderId}`});
        }

    }).catch(err => res.json(err))
})



//CREAR UNA ORDEN
router.post('/', (req, res) => {

    let {userId, products} = req.body

    if (userId !== null && userId > 0 && !isNaN(userId)) {
        database.table('orders')
            .insert({
                user_id: userId
            }).then(newOrderId => {

                if (newOrderId > 0) {

                    products.forEach(async (p) => {

                        let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();

                        let inCart = p.incart//# productos en el carrito

                        if (data.quantity > 0) {
                            
                            data.quantity =  data.quantity  - inCart

                            if (data.quantity < 0) {
                                
                                data.quantity = 0
                            }

                        } else {

                            data.quantity = 0

                            return;
                        }

                        database.table('orders_details')
                            .insert({
                                orderId: newOrderId,
                                product_id: p.id,
                                quantity: inCart

                            }).then(newId => {
                                database.table('products')
                                    .filter({id: p.id})
                                    .update({
                                        quantity: data.quantity
                                    }).then(success => {}).catch(err => console.log(err))

                            }).catch(err => console.log(err))

                    })
                    
                } else {
                    res.json({message: 'New order failed while adding order details', success: false});
                }

                res.json({
                    message: `Order successfully placed with order id ${newOrderId}`,
                    success: true,
                    order_id: newOrderId,
                    products: products
                })

            }).catch(err => console.log(err))
    }

    else{
        res.json({message: 'New order failed', success: false});
    }
})


//ORDER FAKE PAYMENT

router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true})
    }, 3000);
})

module.exports = router