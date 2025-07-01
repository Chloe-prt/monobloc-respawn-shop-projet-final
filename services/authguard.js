const { PrismaClient } = require('@prisma/client'); // Import correct
const Prisma = new PrismaClient(); // Initialisation de Prisma
const authguard = async (req, res, next) => {
    try {
        // req.session.user = {
        //     id: 2,
        //     firstname: 'Pieront',
        //     lastname: 'Chloé',
        //     pseudo: 'Zeraldo',
        //     mail: 'chloe.pieront@gmail.com',
        //     tel: 663491846,
        //     photo: null,
        //     adress: null,
        //     password: '$2b$10$ZNbMlHwQt6tjfQR7it23O..wiVMMr6bf2VQgZVW7UqZx6tfyJsxFy'
        // }
        if (req.session.user) {

            let user = await Prisma.user.findFirst({
                where: {
                    OR: [
                        { mail: req.session.user.mail },
                        { tel: isNaN(parseInt(req.session.user.tel)) ? undefined : parseInt(req.session.user.tel) }
                    ]
                }
            })

            if (user) {
                return next()
            }

        }
        throw new Error("User not found")
    } catch (error) {
        console.log(error);

        res.redirect('/login')
    }
}

module.exports = authguard