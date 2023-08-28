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
    const { name, email, password } = req.body;

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

app.get('/', async (req, res) => {
    try {
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Run Server:
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Running server on localhost:${PORT}`);
});