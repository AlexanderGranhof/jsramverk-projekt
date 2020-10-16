import express from 'express'
import * as jwt from '../../services/jwt'
import { wrapAsync } from '../middleware/async'
import { authenticate } from '../middleware/auth'
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

            const userAlreadyExists = await User.findOne(req.body)

            if (!!userAlreadyExists) {
                return res.status(400).json({
                    message: 'username already exists',
                })
            }

            const createdUser = await new User(req.body).save()

            return res.status(200).send({
                name: createdUser.name,
                balance: createdUser.balance,
            })
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

        const userData = {
            balance: result.balance,
            name: result.name,
        }

        jwt.generateJWT(res, userData)

        return res.status(200).json(userData)
    }),
)

router.post('/signout', (req, res) => {
    jwt.removeJWT(res)

    return res.status(200).send()
})

router.get(
    '/validate/cookie',
    wrapAsync(async (req, res) => {
        try {
            const { name } = jwt.parseJWT(req) as Record<string, string>
            const { User } = await db

            const user = await User.findOne({ name })

            if (!user) {
                return res.status(401).json({})
            }

            return res.json({ name, balance: user.balance })
        } catch {
            return res.status(401).json({})
        }
    }),
)

router.post(
    '/balance',
    authenticate,
    wrapAsync(async (req, res) => {
        const { add } = req.body

        if (!add) {
            return res.status(400).send()
        }

        const { User } = await db

        await User.findOneAndUpdate({ name: req.jwtBody.name }, { $inc: { balance: add } })
        const updatedData = await User.findOne({ name: req.jwtBody.name })

        return res.json({
            balance: updatedData?.balance,
        })
    }),
)

export default router
