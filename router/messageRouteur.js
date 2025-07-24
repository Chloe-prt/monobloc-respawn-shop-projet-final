const messageRouteur = require("express").Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authguard = require("../services/authguard.js")
const upload = require('../services/multer.js')
const { parse } = require('dotenv')

messageRouteur.get('/conv/:id', authguard, async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const sessionUserId = req.session.user.id

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {senderId: sessionUserId, receiverId: userId},
                    {senderId: userId, receiverId: sessionUserId}
                ]
            },
            orderBy: {
                date: 'asc'
            }
        })

        res.render('pages/conversation.html.twig', { 
            isConv: true, 
            userMsg: user, 
            sessionUserId: sessionUserId, 
            messages: messages,
            returnTo: req.headers.referer || '/'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send("marche pas");
    }
})

messageRouteur.post('/sendmsg/:id', authguard, async (req, res) => {
    try {
        const { text } = req.body
        const message = await prisma.message.create({
            data: {
                text,
                sender: {
                    connect: {
                        id: req.session.user.id
                    }
                },
                receiver: {
                    connect: {
                        id: parseInt(req.params.id)
                    }
                }
            }
        })
        res.redirect('back')
    } catch (error) {
        console.log(error);
        res.status(500).send("marche pas");
    }
})

messageRouteur.get('/message', authguard, async (req, res) => {
    try {
        const userId = req.session.user.id
        const conversation = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: {
                date: 'desc'
            },
            include: {
                sender: true,
                receiver: true
            }
        })
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        res.render('pages/message.html.twig', { isConnected: true, conversation: conversation, user: user })
    } catch (error) {
        console.log(error);
        res.status(500).send("marche pas");
    }
})




module.exports = messageRouteur