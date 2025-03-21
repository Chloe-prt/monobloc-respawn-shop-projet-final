const express = require('express')
const session = require('express-session')

const app = express()

app.use(express.static("./public"))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'jaimelechocolat', 
    resave: true,
    saveUninitialized: true
}))

app.listen(process.env.PORT, () => {
    console.log("server is running on port 3000");
    
})

app.get("*", (req, res) => {
    res.redirect("/register")
})

require("dotenv").config()