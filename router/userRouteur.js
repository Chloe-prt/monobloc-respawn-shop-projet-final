const userRouteur = require("express").Router();
const { PrismaClient } = require('@prisma/client'); // Import correct
const prisma = new PrismaClient(); // Initialisation de Prisma
const bcrypt = require('bcrypt'); // Import de bcrypt
const authguard = require("../services/authguard.js");

userRouteur.get('/register', async (req, res) => {
    res.render('pages/register.html.twig');
});

userRouteur.post('/register', async (req, res) => {
    try {
        console.log(req.body);
        
        const { firstname, lastname, pseudo, mail, tel, password, confpass } = req.body;

        if (password !== confpass) {
            console.log(password);
            console.log(confpass);
            
            
            throw { confpass: "Les mots de passe ne correspondent pas" };
        } else {
            const user = await prisma.user.create({ 
                data: {
                    firstname,
                    lastname,
                    pseudo,
                    mail,
                    tel: parseInt(tel),
                    password : bcrypt.hashSync(password, 10) // Hashage du mot de passe
                }
            });
        
            res.redirect('/login');
        }
    } catch (error) {
        if (error.code === "P2002") {
            if (error.meta?.target?.includes("mail")) {
                error = { mail: "Cet email est déjà utilisé" };
            } else if (error.meta?.target?.includes("tel")) {
                error = { tel: "Ce numéro de téléphone est déjà utilisé" };
            }
        }

        console.log(error);
        res.render('pages/register.html.twig', { title: "inscription", error });
    }
});

userRouteur.post("/login", async(req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { mail: req.body.identifiant },
                    { tel: isNaN(parseInt(req.body.identifiant)) ? undefined : parseInt(req.body.identifiant) }
                ]
            }
        })
        
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.user = user;
               
                
                res.redirect('/');
            } else {
                throw {password: "Mot de passe incorrect"}
            }
        } else {
            throw {error: "Compte introuvable"}
        }
    } catch (error) {
        res.render("pages/login.html.twig", 
            {
                title: "Connexion",
                error
            }
        )
        console.log(error);
    }
})

userRouteur.get('/login', async (req, res) => {
    res.render('pages/login.html.twig');
})



userRouteur.get('/', authguard, async (req, res) => {
    const products = await prisma.products.findMany({

    });
    res.render('pages/home.html.twig',{
        products:products,
        isConnected:true
    })
})

userRouteur.get('/sell', authguard, async (req, res) => {
    res.render('pages/sell.html.twig')
})

userRouteur.get('/param', authguard, async (req, res) => {
    res.render('pages/param.html.twig', { isConnected: true });
})

userRouteur.get('/paramprofil', authguard, async (req, res) => {
    res.render('pages/param-profil.html.twig', { isConnected: true, user: req.session.user});
})

userRouteur.get('/myprofil', authguard, async (req, res) => {
    
    const user = req.session.user;
    
    const userId = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            products: true, // Inclure les produits associés à l'utilisateur
        }
    });
    console.log(userId);
    
    
    res.render('pages/myprofil.html.twig', { isConnected: true, user: userId  });
})

userRouteur.get('/updateprofil/:id', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.session.user.id)
            }
        })

        res.render('pages/myprofil.html.twig')
    } catch (error) {
        console.log(error);
        res.render('pages/param-profil.html.twig');
    }
})

userRouteur.post('/updateprofil/:id', authguard, async (req, res) => {
    try {
        const { firstname, lastname, pseudo, mail, tel, photo } = req.body;
        const user = await prisma.user.update({
            where: {
                id: parseInt(req.session.user.id)
            },
            data: {
                firstname,
                lastname,
                pseudo,
                mail,
                tel: parseInt(tel),
                photo : req.file ? req.file.filename : "default-avatar.png"
            }
        })
    } catch (error) {
        console.log(error);
        res.redirect('/paramprofil');
        
    }
})

userRouteur.get('/logout', authguard, async (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

module.exports = userRouteur;