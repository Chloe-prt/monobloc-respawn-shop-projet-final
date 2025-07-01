const { PrismaClient } = require('@prisma/client')
const authguard = require("../services/authguard.js")
const upload = require('../services/multer.js')
const { parse } = require('dotenv')

const adressRouteur = require('express').Router()
const prisma = new PrismaClient()

const departements = {
    "01": "Ain",
    "02": "Aisne",
    "03": "Allier",
    "04": "Alpes-de-Haute-Provence",
    "05": "Hautes-Alpes",
    "06": "Alpes-Maritimes",
    "07": "Ardèche",
    "08": "Ardennes",
    "09": "Ariège",
    "10": "Aube",
    "11": "Aude",
    "12": "Aveyron",
    "13": "Bouches-du-Rhône",
    "14": "Calvados",
    "15": "Cantal",
    "16": "Charente",
    "17": "Charente-Maritime",
    "18": "Cher",
    "19": "Corrèze",
    "2A": "Corse-du-Sud",
    "2B": "Haute-Corse",
    "21": "Côte-d'Or",
    "22": "Côtes-d'Armor",
    "23": "Creuse",
    "24": "Dordogne",
    "25": "Doubs",
    "26": "Drôme",
    "27": "Eure",
    "28": "Eure-et-Loir",
    "29": "Finistère",
    "30": "Gard",
    "31": "Haute-Garonne",
    "32": "Gers",
    "33": "Gironde",
    "34": "Hérault",
    "35": "Ille-et-Vilaine",
    "36": "Indre",
    "37": "Indre-et-Loire",
    "38": "Isère",
    "39": "Jura",
    "40": "Landes",
    "41": "Loir-et-Cher",
    "42": "Loire",
    "43": "Haute-Loire",
    "44": "Loire-Atlantique",
    "45": "Loiret",
    "46": "Lot",
    "47": "Lot-et-Garonne",
    "48": "Lozère",
    "49": "Maine-et-Loire",
    "50": "Manche",
    "51": "Marne",
    "52": "Haute-Marne",
    "53": "Mayenne",
    "54": "Meurthe-et-Moselle",
    "55": "Meuse",
    "56": "Morbihan",
    "57": "Moselle",
    "58": "Nièvre",
    "59": "Nord",
    "60": "Oise",
    "61": "Orne",
    "62": "Pas-de-Calais",
    "63": "Puy-de-Dôme",
    "64": "Pyrénées-Atlantiques",
    "65": "Hautes-Pyrénées",
    "66": "Pyrénées-Orientales",
    "67": "Bas-Rhin",
    "68": "Haut-Rhin",
    "69": "Rhône",
    "70": "Haute-Saône",
    "71": "Saône-et-Loire",
    "72": "Sarthe",
    "73": "Savoie",
    "74": "Haute-Savoie",
    "75": "Paris",
    "76": "Seine-Maritime",
    "77": "Seine-et-Marne",
    "78": "Yvelines",
    "79": "Deux-Sèvres",
    "80": "Somme",
    "81": "Tarn",
    "82": "Tarn-et-Garonne",
    "83": "Var",
    "84": "Vaucluse",
    "85": "Vendée",
    "86": "Vienne",
    "87": "Haute-Vienne",
    "88": "Vosges",
    "89": "Yonne",
    "90": "Territoire de Belfort",
    "91": "Essonne",
    "92": "Hauts-de-Seine",
    "93": "Seine-Saint-Denis",
    "94": "Val-de-Marne",
    "95": "Val-d'Oise",
    "971": "Guadeloupe",
    "972": "Martinique",
    "973": "Guyane",
    "974": "La Réunion",
    "976": "Mayotte"
}


const regions = {
    "01": "Auvergne-Rhône-Alpes",
    "02": "Bourgogne-Franche-Comté",
    "03": "Bretagne",
    "04": "Centre-Val de Loire",
    "05": "Corse",
    "06": "Grand Est",
    "07": "Hauts-de-France",
    "08": "Île-de-France",
    "09": "Normandie",
    "10": "Nouvelle-Aquitaine",
    "11": "Occitanie",
    "12": "Pays de la Loire",
    "13": "Provence-Alpes-Côte d'Azur",
    "14": "Guadeloupe",
    "15": "Martinique",
    "16": "Guyane",
    "17": "La Réunion",
    "18": "Mayotte"
}


adressRouteur.get('/adress', authguard, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        }
    })
    
    res.render('pages/adress.html.twig', { formstyle: true, user: user, returnTo: req.headers.referer || '/' })
})

adressRouteur.post('/adress', authguard, async (req, res) => {
    try {
        const { street, city, code, departement, region } = req.body

        const departementName = departements[departement] || departement;
        const regionName = regions[region] || region;
        console.log("User ID from session:", req.session.user.id);

        await prisma.user.update({
            where: {
                id: req.session.user.id
            },
            data: {
                adress: {
                    connectOrCreate: {
                        where: {
                            street_city_code_departement_region: {
                                street: street,
                                city: city,
                                code: parseInt(code),
                                departement: departementName,
                                region: regionName
                            }
                        },
                        create: {
                            street: street,
                            city: city,
                            code: parseInt(code),
                            departement: departementName,
                            region: regionName,
                        }

                    }
                }
            }
        });
        res.redirect('/myprofil')
    } catch (error) {
        console.log(error);
        res.render('pages/adress.html.twig')
    }
})


adressRouteur.get('/adressupdate/:id', authguard, async (req, res) => {
    try {
        console.log(req.session.user);
        
        const adress = await prisma.adress.findUnique({
            where: {
                id:parseInt(req.params.id)
            }
        })
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            }
        })
        res.render('pages/adress.html.twig', {
            adressId: adress.id,
            adress: adress,
            formstyle: true,
            user: user,
            returnTo: req.headers.referer || '/'
        })
    } catch (error) {
        console.log(error);
        res.redirect('/param')
    }
})

// adressRouteur.post('/adressupdate', authguard, async (req, res) => {
//     try {
//         const { street, city, code, departement, region } = req.body;

//         const departementName = departements[departement] || departement;
//         const regionName = regions[region] || region;

//         await prisma.adress.update({
//             where: {
//                 id: req.session.user.adressId // Utilisez l'ID de l'adresse associée à l'utilisateur
//             },
//             data: {
//                 street: street,
//                 city: city,
//                 code: parseInt(code),
//                 departement: departementName,
//                 region: regionName
//             }
//         });

//         res.redirect('/myprofil');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Erreur lors de la mise à jour de l\'adresse');
//     }
// });

adressRouteur.post('/adressupdate', authguard, async (req, res) => {
    try {
        const { street, city, code, departement, region } = req.body;

        const departementName = departements[departement] || departement;
        const regionName = regions[region] || region;

        await prisma.user.update({
            where: {
                id: req.session.user.id 
            },
            data: {
                adress: {
                    connectOrCreate: {
                        where: {
                            street_city_code_departement_region: {
                                street: street,
                                city: city,
                                code: parseInt(code),
                                departement: departementName,
                                region: regionName
                            }
                        },
                        create: {
                            street: street,
                            city: city,
                            code: parseInt(code),
                            departement: departementName,
                            region: regionName
                        }
                    }
                }
            }
        });

        res.redirect('/myprofil');
    } catch (error) {
        console.log(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'adresse');
    }
});

module.exports = adressRouteur