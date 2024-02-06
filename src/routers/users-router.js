import { Router } from "express";
import validateSchema from "../middlewares/validation-middleware.js";
import validateAuth from "../middlewares/authentication-middleware.js";
import { signUpSchema, signInSchema } from "../schemas/users-schema.js";
import { postSignUp, postSignIn, postLogOut } from "../controllers/users-controller.js";

const usersRoute = Router();

usersRoute.post('/cadastro', validateSchema(signUpSchema), postSignUp);
usersRoute.post('/', validateSchema(signInSchema), postSignIn);
usersRoute.delete('/', validateAuth, postLogOut);

export default usersRoute;