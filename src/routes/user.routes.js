import { Router } from "express";
import {
  changeAvatar,
  changeCurrentPassword,
  changeusername,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/users.controllers.js";
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
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/change-username").patch(verifyJWT, changeusername);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/change-avatar").post(
  upload.fields([
    {
      name: "newavatar",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  changeAvatar
);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
