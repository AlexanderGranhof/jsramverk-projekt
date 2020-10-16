import express from 'express'
import * as jwt from '../../services/jwt'
import { wrapAsync } from '../middleware/async'
import db from '../../services/db'
import * as validate from '../middleware/validate'
import { UserSchema } from '../../models'

const router = express.Router()

router.post(
    '/register',
    validate.joi(UserSchema),
    wrapAsync(async (req, res) => {
        try {
            const { User } = await db

            const userAlreadyExists = !!(await User.find(req.body))

            if (userAlreadyExists) {
                return res.status(400).json({
                    message: 'username already exists',
                })
            }

            await new User(req.body).save()

            return res.status(200).send()
        } catch (e) {
            console.error(e)

            return res.status(500).json({
                message: 'an error occured',
            })
        }
    }),
)

router.post(
    '/signin',
    validate.joi(UserSchema),
    wrapAsync(async (req, res) => {
        const { User } = await db
        const result = await User.findOne(req.body)

        if (result === null) {
            return res.status(404).send()
        }

        jwt.generateJWT(res, { name: result.name })

        return res.status(200).send()
    }),
)

router.post('/signout', (req, res) => {
    jwt.removeJWT(res)

    return res.status(200).send()
})

router.get('/validate/cookie', (req, res) => {
    return res.json({
        valid: jwt.validateJWT(req),
    })
})

export default router
