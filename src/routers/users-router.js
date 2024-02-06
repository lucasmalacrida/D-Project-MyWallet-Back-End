import { Router } from "express";
import validateSchema from "../middlewares/validation-middleware.js"
import { signUpSchema, signInSchema } from "../schemas/users-schema.js";
import { postSignUp, postSignIn, postLogOut } from "../controllers/users-controller.js";

const usersRoute = Router();

usersRoute.post('/cadastro', validateSchema(signUpSchema), postSignUp);
usersRoute.post('/', validateSchema(signInSchema), postSignIn);
usersRoute.delete('/', postLogOut);

export default usersRoute;