import { Router } from "express";
import {
  getTheCurentUserProfileDetails,
  getUserProfileDetailsByName,
  getUsersWithPagination,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginLimiter, apiLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

/* ---------- PUBLIC ROUTES ---------- */
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/refresh-token", refreshAccessToken);

/* ---------- PROTECTED ROUTES ---------- */
router.post("/logout", verifyJWT, logoutUser);
router.post("/getallusers", verifyJWT, apiLimiter, getUsersWithPagination);
router.post("/getcurrentuser", verifyJWT, apiLimiter, getTheCurentUserProfileDetails);
router.post("/searchusers", verifyJWT, apiLimiter, getUserProfileDetailsByName);

export default router;