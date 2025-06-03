const express = require('express')
const session = require('express-session')

const userRouteur = require('./router/userRouteur')
const productRouteur = require('./router/productsRouteur')
require('dotenv').config()


const app = express()

app.use(express.static("./public"))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'jaimelechocolat', 
    resave: true,
    saveUninitialized: true
}))

app.use(userRouteur)
app.use(productRouteur)

app.listen(process.env.PORT, () => {
    console.log("server is running on port 3001");
    
})


app.use((req, res) => {
    res.send("Page not found")
})

require("dotenv").config()