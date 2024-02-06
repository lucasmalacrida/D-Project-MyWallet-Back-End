import db from "../config/database.js";
import dayjs from 'dayjs';
dayjs().format();

export async function postRegistry(req, res) {
    const { name, amount } = req.body;
    const type = req.params.tipo;
    const userId = res.locals.userId;

    try {
        const date = dayjs().format('DD/MM');
        const newRegistry = { date, name, amount, type };

        await db.collection('registries').updateOne(
            { userId },
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
    const user = res.locals.user;
    const userId = res.locals.userId;

    try {
        const registriesObject = await db.collection('registries').findOne({ userId });
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