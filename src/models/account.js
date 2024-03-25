import mongoose from "mongoose";

const acountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  bankInfo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  buget: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
  },
});

const AcountModel = mongoose.model("Account", acountSchema);

export default AcountModel;
