const express = require('express')

const router = express.Router()

const { database } = require('../config/helpers')


router.get('/', (req, res) => {

    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10

    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit
        endValue = page * limit
    }
    else{
        startValue = 0
        endValue = 10
    }

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.id = p.cat_id`
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                })
            }
            else{
                res.json({message: 'no products founds'})
            }
        })
        .catch(err => console.log(err))
})

//FILTRAR POR ID
router.get('/:id', (req, res) => {

    let product = req.params.id
    
    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.id = p.cat_id`
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.images',
            'p.id'
        ])
        .filter({'p.id': product})
        .get()
        .then(prod => {
            if (prod) {
                res.status(200).json(prod)
            }
            else{
                res.json({message: `No product found with id ${product}`});
            }
        })
        .catch(err => console.log(err))
})


//OBTENER PRODUCTOS DE UNA CATEGORÍA
router.get('/category/:cat_name', (req, res) => {

    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10

    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit
        endValue = page * limit
    }
    else{
        startValue = 0
        endValue = 10
    }

    let cat_name = req.params.cat_name
    
    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_name}%'`
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: 1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                })
            }
            else{
                res.json({message: `No products found matching the category ${cat_name}`});
            }
        })
        .catch(err => console.log(err))
})


module.exports = router