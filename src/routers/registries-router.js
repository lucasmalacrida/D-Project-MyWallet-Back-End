import { Router } from "express";
import validateAuth from "../middlewares/authentication-middleware.js";
import validateSchema from "../middlewares/validation-middleware.js";
import { newRegistrySchema } from "../schemas/registries-schema.js";
import { postRegistry, getRegistries } from "../controllers/registries-controller.js";

const registriesRoute = Router();

registriesRoute.post('/nova-transacao/:tipo', validateAuth, validateSchema(newRegistrySchema), postRegistry);
registriesRoute.get('/', validateAuth, getRegistries);

export default registriesRoute;