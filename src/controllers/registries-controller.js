import db from "../config/database.js";
import dayjs from 'dayjs';
dayjs().format();

export async function postRegistry(req, res) {
    const { name, amount } = req.body;
    const type = req.params.tipo;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);

    const validation = newRegistrySchema.validate({ name, amount, type }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
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
}

export async function getRegistries(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) { return res.sendStatus(401); }
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) { return res.sendStatus(401); }

        const registriesObject = await db.collection('registries').findOne({ userId: session.userId });
        if (!registriesObject) { return res.status(200).send({ name: user.name, registries: [], cash: 0 }); }

        const registries = registriesObject.registries;
        const cash = registries
            .map(x => x.type === "entrada" ? x.amount : x.type === "saida" ? -x.amount : 0)
            .reduce((a, b) => a + b);

        const response = { name: user.name, registries, cash };

        res.status(200).send(response);
    } catch (err) {
        res.status(500).send(err.message);
    }
}