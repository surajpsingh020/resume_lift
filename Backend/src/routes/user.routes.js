import {
  start,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
  getUserProfile,
} from "../controller/user.controller.js";
import { Router } from "express";
import { isUserAvailable } from "../middleware/auth.js";

const router = Router();

router.get("/", isUserAvailable, start);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isUserAvailable, logoutUser);
router.get("/profile", isUserAvailable, getUserProfile);
router.put("/profile", isUserAvailable, updateProfile);

export default router;
