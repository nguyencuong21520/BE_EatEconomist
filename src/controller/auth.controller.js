import asyncHandler from "express-async-handler";
import AccountModel from "../models/account.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {
  const { email, fullName, bankInfo, password, role = "user" } = req.body;

  const checkExistingAccount = await AccountModel.findOne({
    email: email,
  });

  if (checkExistingAccount) {
    res.status(400);
    throw new Error("Account already exists");
  }

  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);
  const account = await AccountModel.create({
    email,
    fullName,
    bankInfo,
    password,
    role,
  });
  res.status(201).json({
    message: "Account created successfully",
    account,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const account = await AccountModel.findOne({ email: email });

  if (!account) {
    res.status(404);
    throw new Error("Account does not exist");
  }

  const isMatch = password == account.password;

  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid password");
  }

  //generate token
  const payload = {
    id: account._id,
    email: account.email,
    fullName: account.fullName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);

  res.status(200).json({
    message: "Successfully logged in",
    token,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const user = await AccountModel.findOne({ _id: currentUserId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({
    message: "User found",
    data: user,
  });
});

const getUserList = asyncHandler(async (req, res) => {
  const user = await AccountModel.find({}, { password: 0 });
  if (!user) {
    res.status(404);
    throw new Error("User list not found");
  }
  res.status(200).json({
    message: "User list found",
    data: user,
  });
});

const authController = {
  register,
  login,
  getCurrentUser,
  getUserList,
};

export default authController;
