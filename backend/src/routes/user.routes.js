import { Router } from "express";
import {
    getTheCurentUserProfileDetails,
    getUsersWithIdsInBulk,
    getUsersWithPagination,
    loginUser, logoutUser,
    refreshAccessToken, registerUser,
} from "../controllers/user.controller.js";
// import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    // upload.fields([
    //     {
    //         name: "avatar",
    //         maxCount: 1
    //     }
    // ]),
    registerUser
)

router.route('/login').post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/getusersbyids").post(getUsersWithIdsInBulk)
router.route("/getallusers").post(getUsersWithPagination)
router.route("/getcurrentuser").post(getTheCurentUserProfileDetails)

// router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatair)

export default router;