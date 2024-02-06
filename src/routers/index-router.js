import { Router } from "express";
import usersRoute from "./users-router.js";
import registriesRoute from "./registries-router.js";

const router = Router();
router.use(usersRoute);
router.use(registriesRoute);

export default router;