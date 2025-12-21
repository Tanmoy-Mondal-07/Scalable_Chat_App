import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchCurrentUserConversation, fetchMessagesByConversation } from "../controllers/message.controller.js";

const router = Router()

router.route("/messages").post(verifyJWT, fetchMessagesByConversation)
router.route("/current-user").post(verifyJWT, fetchCurrentUserConversation)

export default router;