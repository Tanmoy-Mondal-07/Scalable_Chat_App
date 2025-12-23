import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchCurrentUserConversation, getMessages } from "../controllers/message.controller.js";
import { apiLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router()

router.route("/messages").post(verifyJWT, apiLimiter, getMessages)
router.route("/current-user").post(verifyJWT, apiLimiter, fetchCurrentUserConversation)

export default router;