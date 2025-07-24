const userRouteur = require("express").Router();
const { PrismaClient } = require('@prisma/client'); // Import correct
const prisma = new PrismaClient(); // Initialisation de Prisma
const bcrypt = require('bcrypt'); // Import de bcrypt
const authguard = require("../services/authguard.js");
const upload = require('../services/multer.js')

const mailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/; 
const telRegex = /^0[1-9]\d{8}$/;

userRouteur.get('/register', async (req, res) => {
    res.render('pages/register.html.twig');
});

userRouteur.post('/register', async (req, res) => {
    try {
        
        const { firstname, lastname, pseudo, mail, tel, password, confpass } = req.body;

        if (!mailRegex.test(mail)) {
            throw { mail: "Email invalide" };
        }
        if (!passwordRegex.test(password)) {
            throw { password: "Le mot de passe doit faire au moins 8 caractères, contenir une lettre et un chiffre" };
        }
        if (!telRegex.test(tel)) {
            throw { tel: "Numéro de téléphone invalide" };
        }

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
                    password: bcrypt.hashSync(password, 10) 
                }
            });

            console.log(req.body);
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

userRouteur.post("/login", async (req, res) => {
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
                throw { password: "Mot de passe incorrect" }
            }
        } else {
            throw { error: "Compte introuvable" }
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
        orderBy: {
            date: 'desc'
        },
        take: 10,
        include: {
            user: true
        }
    });
    const userPreference = await prisma.userPreference.findMany({
        where: {
            userId: req.session.user.id
        },
        include: {
            preference: true
        }
    })
    const recommendedProducts = await prisma.products.findMany({
        where: {
            category: {
                in: userPreference.map(up => up.preference.name)
            }
            
        },
        orderBy: {
                date: 'desc'
            },
            take: 10,
            include: {
                user: true
            }
    })
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        }
    })
    res.render('pages/home.html.twig', {
        products: products,
        recommended: recommendedProducts,
        isConnected: true,
        user: user
    })
})

userRouteur.get('/sell', authguard, async (req, res) => {
    res.render('pages/sell.html.twig', { formstyle: true, returnTo: req.headers.referer || '/' })
})

userRouteur.get('/param', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            },
            include: {
                adress: true
            }
        })
        res.render('pages/param.html.twig', { isConnected: true, user: user });
    } catch (error) {
        console.log(error);
        res.status(500).send('Erreur lors du chargement de la page des paramètres');
    }

})

userRouteur.get('/myprofil', authguard, async (req, res) => {

    const user = req.session.user;

    const userId = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            products: {
                orderBy: {
                    date: 'desc'
                }
            },
            adress: true
        }
    });
    console.log(userId);


    res.render('pages/myprofil.html.twig', { isConnected: true, user: userId });
})

userRouteur.get('/profil/:id', authguard, async (req, res) => {
    const userId = req.params.id
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(userId)
        },
        include: {
            products: {
                orderBy: {
                    date: 'desc'
                }
            },
            adress: true
        }
    })
    res.render('pages/profil.html.twig', { user: user, isConnected: true, sessionUser: req.session.user })
})

userRouteur.get('/updateprofil/:id', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        })

        res.render('pages/param-profil.html.twig', {
            userId: user.id,
            user: user,
            formstyle: true,
            returnTo: req.headers.referer || '/'
        })

    } catch (error) {
        console.log(error);
        res.status(500).send('Erreur lors du chargement de la page des paramètres');
    }
})

userRouteur.post('/updateprofil/:id', authguard, upload.single("photo"), async (req, res) => {
    try {
        const { firstname, lastname, pseudo, photo, mail, tel } = req.body;
        if (!mailRegex.test(mail)) {
            throw { mail: "Email invalide" };
        }
        if (!telRegex.test(tel)) {
            throw { tel: "Numéro de téléphone invalide" };
        }
        const user = await prisma.user.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                firstname,
                lastname,
                pseudo,
                mail,
                tel: parseInt(tel),
                photo: req.file ? req.file.filename : req.body.existingPhoto
            }
        })
        res.redirect('/myprofil');
    } catch (error) {
        console.log(error);
        res.render('pages/param-profil.html.twig', {
            userId: req.session.user.id,
            user: req.session.user

        });
    }
})


userRouteur.get('/updatepassword/:id', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.render('pages/password.html.twig', {
            userId: user.id,
            user: user,
            formstyle: true, 
            returnTo: req.headers.referer || '/'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('Erreur lors du chargement de la page des paramètres');
    }
})

userRouteur.post('/updatepassword/:id', authguard, async (req, res) => {
    try {

        const { oldPassword, newPassword, confirmPassword } = req.body

        if (!passwordRegex.test(newPassword)) {
            throw { newPassword: "Le mot de passe doit faire au moins 8 caractères, contenir une lettre et un chiffre" };
        }

        if (await bcrypt.compare(oldPassword, req.session.user.password)) {
            if (newPassword == confirmPassword) {
                const user = await prisma.user.update({
                    where: {
                        id: parseInt(req.params.id)
                    },
                    data: {
                        password: bcrypt.hashSync(newPassword, 10)
                    }
                }) 
            } else {

                throw { confirmPassword: "Les mots de passe ne correspondent pas"}
            }
        } else {
            console.log(oldPassword, req.session.user.password);
            
            throw { oldPassword: "L'ancien mot de passe est incorrect" }
        }

        res.redirect('/myprofil')
    } catch (error) {
        console.log(error);
        res.render('pages/password.html.twig', {
            userId: req.session.user.id,
            user: req.session.user,
            isConnected: true,
            error
        })
    }
})

userRouteur.get('/preferences/:id', authguard, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        }
    })
    res.render('pages/preferences.html.twig', { formstyle: true, user: user, returnTo: req.headers.referer || '/' });
})

userRouteur.post('/preferences/:id', authguard, async (req, res) => {
    try {
        let preferences = req.body['preferences[]'] || req.body.preferences || []
        if (!Array.isArray(preferences)) {
            preferences = [preferences];
        }

        const preferenceRecords = await prisma.preference.findMany({
            where: {
                name: { in: preferences }
            }
        })

        await prisma.userPreference.deleteMany({
            where: {
                userId: parseInt(req.params.id)
            }
        })

        for ( const preference of preferenceRecords) {
            await prisma.userPreference.create({
                data: {
                    userId: parseInt(req.params.id),
                    preferenceId: preference.id
                }
            })
        }

        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.status(500).send('Erreur lors de la sauvegarde des préférences');
    }
})

userRouteur.post('/like/:id', authguard, async (req, res) => {
    try {

        const userId = req.session.user.id
        const productId = parseInt(req.params.id)

        const like = await prisma.like.findFirst({
            where: { userId: userId, productId: productId }
        })

        if (like) {
            await prisma.like.delete({
                where: { id: like.id }
            })
        } else {
            await prisma.like.create({
                data: {
                    userId: userId, 
                    productId: productId
                }
            })
        }

        res.redirect('back')
    } catch (error) {
        console.log(error);
        res.status(500).send('erreur lors du like')
    }

})

userRouteur.get('/like', authguard, async (req, res) => {
    const likes = await prisma.like.findMany({
        where: {
            userId: req.session.user.id
        },
        include: {
            product: {
                include: {
                    user: true
                }
            }
        }
    })
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        }
    })
    res.render('pages/like.html.twig', { isConnected: true, likes: likes, user: user })
})




userRouteur.get('/logout', authguard, async (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})



module.exports = userRouteur;