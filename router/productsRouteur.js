const { PrismaClient } = require('@prisma/client')
const  authguard = require("../services/authguard.js")
const upload = require('../services/multer.js')

const productsRouteur = require('express').Router()
const prisma = new PrismaClient()

productsRouteur.post('/sell', authguard, upload.single("photo"), async(req, res) => {
    try {
        const {name, photo, category, brand, state, price, description} = req.body
        const products = await prisma.products.create({
            data : {
                name,
                photo : req.file ? req.file.filename : "default.jpg", 
                category,
                brand,
                state,
                price: parseInt(price),
                description,
                user: {
                    connect: {
                        id: req.session.user.id
                    }
                }
            } 
        })
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.render('pages/sell.html.twig');
    }
})

productsRouteur.get('/product/:id', authguard, async (req, res) => {
    const productId = req.params.id
    const product = await prisma.products.findUnique({
        where: {
            id: parseInt(productId)
        },
        include: {
            user: true
        }
    })
    res.render('pages/product.html.twig', { product, isConnected: true })
})


module.exports = productsRouteur