const messageRouteur = require("express").Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authguard = require("../services/authguard.js")
const upload = require('../services/multer.js')
const { parse } = require('dotenv')

messageRouteur.get('/message', authguard, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        }
    })
    res.render('pages/message.html.twig', { isConnected: true, user: user })
})

messageRouteur.get('/conversation/:id', authguard, async (req, res) => {
    const conversationId = parseInt(req.params.id)
    const sessionUserId = Number(req.session.user.id)

    if (isNaN(conversationId)) {
        return res.status(400).send("ID de conversation invalide");
    }
    
    if (conversationId === 0 && req.query.otherUserId) {
        const otherUserId = Number(req.query.otherUserId)

        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    {user1Id: sessionUserId, user2Id: otherUserId},
                    {user1Id: otherUserId, user2Id: sessionUserId}
                ]
            }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: sessionUserId,
                    user2Id: otherUserId
                }
            })
        }

        return res.redirect(`/conversation/${conversation.id}`)
    }

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        },
        include: {
            user1: true,
            user2: true,
            messages: {
                include: {
                    user: true
                }
            }
        }
    })

    let otherUser = ""
    const user1Id = Number(conversation.user1Id);
    const user2Id = Number(conversation.user2Id);
    const myId = Number(sessionUserId);
    if (user1Id === myId) {
        otherUser = conversation.user2;
    } else if (user2Id === myId) {
        otherUser = conversation.user1;
    } else {
        return res.status(403).send("Accès interdit à cette conversation");
    }

    console.log("params.id:", req.params.id, "query.otherUserId:", req.query.otherUserId, "sessionUserId:", sessionUserId);
    
    res.render('pages/conversation.html.twig', {
        isConv: true,
        conversation: conversation,
        otherUser: otherUser,
        user: req.session.user
    })
})

messageRouteur.post('/sendmsg', authguard, upload.single("photo"), async (req, res) => {
    try {
        const { text, conversationId } = req.body
        const message = await prisma.message.create({
            data: {
                text,
                photo: req.file ? req.file.filename : undefined,
                user: {
                    connect: {
                        id: req.session.user.id
                    }
                },
                conversation: {
                    connect: { id: Number(conversationId) }
                }
            }
        })
        res.redirect(`/conversation/${conversationId}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("error");
    }
})


module.exports = messageRouteur