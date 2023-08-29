// Imports:
import express, { json } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcryptjs from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { stripHtml } from "string-strip-html";

// Configs:
const app = express();
app.use(cors());
app.use(json());
dotenv.config();
dayjs().format();

// DataBase:
const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect();
    console.log('MongoDB Connected!');
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db();

// Schemas:
const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});
const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});
const newRegistrySchema = joi.object({
    name: joi.string().required(),
    amount: joi.number().greater(0).required(),
    type: joi.string().valid('entrada', 'saida').required()
});

// EndPoints:
app.post('/cadastro', async (req, res) => {
    const { name, email, password } = req.body;

    const validation = signUpSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        // DBs Validations
        const user = await db.collection('users').findOne({ email });
        if (user) { return res.status(409).send("E-mail já cadastrado!") }

        await db.collection('users').insertOne({ name, email, password: bcryptjs.hashSync(password, 10) });

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/', async (req, res) => {
    const { email, password } = req.body;

    const validation = signInSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        // DBs Validations
        const user = await db.collection('users').findOne({ email });
        if (!user) { return res.status(409).send("E-mail não cadastrado!") }
        if (!bcryptjs.compareSync(password, user.password)) { return res.status(401).send("Senha Incorreta!") }

        const token = uuid();
        await db.collection('sessions').insertOne({ userId: user._id, token });

        res.status(200).send({ name: user.name, token });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/nova-transacao/:tipo', async (req, res) => {
    const { name, amount } = req.body;
    const type = req.params.tipo;
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verificando se o Token foi recebido
    if (!token) return res.sendStatus(401);

    const validation = newRegistrySchema.validate({ name, amount, type }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        // DBs Validations
        const session = await db.collection('sessions').findOne({ token });
        if (!session) { return res.sendStatus(401); }
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) { return res.sendStatus(401); }

        const date = dayjs().format('DD/MM');
        const newRegistry = { date, name, amount, type };

        await db.collection('registries').updateOne(
            { userId: session.userId },
            {
                $push: {
                    registries: {
                        $each: [newRegistry],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        );

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/home', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verificando se o Token foi recebido
    if (!token) return res.sendStatus(401);

    try {
        // DBs Validations
        const session = await db.collection('sessions').findOne({ token });
        if (!session) { return res.sendStatus(401); }
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) { return res.sendStatus(401); }

        const registriesObject = await db.collection('registries').findOne({ userId: session.userId });
        if (!registriesObject) { return res.status(200).send({name: user.name, registries: [], cash: 0}); }

        const registries = registriesObject.registries;
        const cash = registries
            .map(x => x.type === "entrada" ? x.amount : x.type === "saida" ? -x.amount : 0)
            .reduce((a, b) => a + b);

        const response = { name: user.name, registries, cash };

        res.status(200).send(response);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verificando se o Token foi recebido
    if (!token) return res.sendStatus(401);

    try {
        // DBs Validations
        const session = await db.collection('sessions').findOne({ token });
        if (!session) { return res.sendStatus(401); }

        const result = await db.collection('sessions').deleteOne({ _id: session._id });
        if (result.deletedCount === 0) { return res.sendStatus(404) }
        return res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Run Server:
const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`Running server on port ${port}`)
});