import { Router } from "express";
import validateSchema from "../middlewares/validation-middleware.js"
import { newRegistrySchema } from "../schemas/registries-schema.js";
import { postRegistry, getRegistries } from "../controllers/registries-controller.js";

const registriesRoute = Router();

registriesRoute.post('/nova-transacao/:tipo', validateSchema(newRegistrySchema), postRegistry);
registriesRoute.get('/', getRegistries);

export default registriesRoute;