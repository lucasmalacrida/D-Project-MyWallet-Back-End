import db from "../config/database.js";
import bcryptjs from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function postSignUp(req, res) {
    const { name, email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });
        if (user) { return res.status(409).send("E-mail já cadastrado!") }

        await db.collection('users').insertOne({ name, email, password: bcryptjs.hashSync(password, 10) });

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postSignIn(req, res) {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) { return res.status(409).send("E-mail não cadastrado!") }
        if (!bcryptjs.compareSync(password, user.password)) { return res.status(401).send("Senha Incorreta!") }

        const token = uuid();
        await db.collection('sessions').insertOne({ userId: user._id, token });

        res.status(200).send({ name: user.name, token });
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postLogOut(req, res) {
    const sessionId = res.locals.sessionId;

    try {
        const result = await db.collection('sessions').deleteOne({ _id: sessionId });
        if (result.deletedCount === 0) { return res.sendStatus(404) }
        return res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}