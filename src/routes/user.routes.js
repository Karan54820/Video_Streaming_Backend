import { Router } from "express";
import { changeCurrentPassword, changeusername, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 2,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/change-username").post(verifyJWT,changeusername);
router.route("/get-current-user").get(verifyJWT,getCurrentUser);

export default router;
