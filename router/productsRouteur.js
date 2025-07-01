const { PrismaClient } = require('@prisma/client')
const  authguard = require("../services/authguard.js")
const upload = require('../services/multer.js')
const { parse } = require('dotenv')

const productsRouteur = require('express').Router()
const prisma = new PrismaClient()

const stateChange = {
    "neuf": "État Neuf",
    "perfect": "Parfait état",
    "good": "Bon état",
    "ok": "État correct",
    "no": "Pour pièces"
}

productsRouteur.post('/sell', authguard, upload.single("photo"), async(req, res) => {
    try {
        const {name, photo, category, brand, state, price, description} = req.body
        const stateValue = stateChange[state] || state;
        const products = await prisma.products.create({
            data : {
                name,
                photo : req.file ? req.file.filename : "default.jpg", 
                category,
                brand,
                state: stateValue,
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
    const userId = req.session.user.id

    const product = await prisma.products.findUnique({
        where: {
            id: parseInt(productId)
        },
        include: {
            user: {
                include: {
                    adress:true
                }
            },
            likes: true
        }
    })
    const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            }
        })

    const liked = product.likes.some(like => like.userId === userId)

    res.render('pages/product.html.twig', { product, isConnected: true, user: user, liked: liked  })
})


productsRouteur.get('/productdelete/:id', authguard, async (req, res) => {
    try {
        const product = await prisma.products.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect('/myprofil')
    } catch (error) {
        console.log(error);
        res.redirect('/myprofil')
    }
})

productsRouteur.get('/productupdate/:id', authguard, async (req, res) => {
    try {
        const product = await prisma.products.findUnique({
            where: {
                id:parseInt(req.params.id)
            }
        })
        
        res.render('pages/sell.html.twig', {
            productId : product.id,
            product : product,
        })
    } catch (error) {
        console.log(error);
        res.render('pages/sell.html.twig')
    }
})

productsRouteur.post('/productupdate/:id', upload.single("photo"), authguard, async (req, res) => {
    try {
        const {name, photo, category, brand, state, price, description} = req.body
        const stateValue = stateChange[state] || state;
        const product = await prisma.products.update({
            where: {
                id:parseInt(req.params.id)
            }, 
            data: {
                name,
                photo : req.file ? req.file.filename : req.body.existingPhoto, 
                category,
                brand,
                state: stateValue,
                price: parseInt(price),
                description
            }
        })
        res.redirect('/myprofil')
    } catch (error) {
        console.log(error);
        res.render('/myprofil')
    }
})

productsRouteur.get('/search', authguard, async (req, res) => {
    const search = req.query.search
    console.log(search);
    try {
        const results = await prisma.products.findMany({
            where: {
                OR: [
                    {name: { contains: search }},
                    {description: { contains: search }},
                    {category: { contains: search }},
                    {brand: { contains: search }}
                ]
            },
            include: {
                user: true
            }
        })
        console.log(results);
        res.render('pages/search.html.twig', {results, search, isConnected: true})
    } catch (error) {
        console.log(error);
        res.status(500).send("marche pas");
    }
})

module.exports = productsRouteur