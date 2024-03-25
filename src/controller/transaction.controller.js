import asyncHandler from "express-async-handler";
import TransactionModel from "../models/transaction.js";
import TransactionDetailModel from "../models/transactionDetail.js";

const createTransaction = asyncHandler(async (req, res) => {
  const {
    amount,
    discount,
    type,
    date,
    description,
    status,
    transactionDetail = [],
  } = req.body;

  const owner = req.user.id;
  const newTransaction = new TransactionModel({
    owner,
    amount,
    discount,
    type,
    date,
    status,
    description,
  });

  const savedTransaction = await newTransaction.save();
  const transactionId = savedTransaction._id;
  const updateTransactionDetail = transactionDetail.map((detail) => ({
    ...detail,
    transactionId,
  }));

  const insertedTransactionDetail = await TransactionDetailModel.insertMany(
    updateTransactionDetail
  );
  res.status(201).json({
    message: "Transaction created successfully",
    newTransaction,
    insertedTransactionDetail,
  });
});

const updateTransactionDetail = asyncHandler(async (req, res) => {
  const transactionDetailId = req.query.id;
  const { id: userId, role: userRole } = req.user; // Destructuring để làm code gọn gàng hơn
  const transactionDetail = await TransactionDetailModel.findById(
    transactionDetailId
  ).populate("transactionId");
  console.log(
    "🚀 ~ updateTransactionDetail ~ transactionDetail:",
    transactionDetail
  );

  if (!transactionDetail) {
    return res.status(404).json({ message: "Transaction detail not found" });
  }

  if (
    userId === transactionDetail.transactionId.owner.toString() ||
    userRole === "admin"
  ) {
    // Giả định `userId` là thuộc tính đúng của model
    const updatedTransactionDetail =
      await TransactionDetailModel.findByIdAndUpdate(
        transactionDetailId,
        req.body,
        { new: true }
      );
    return res.status(200).json({
      message: "Transaction detail updated successfully",
      transactionDetail: updatedTransactionDetail, // Trả về chi tiết đã cập nhật
    });
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized to update this transaction detail" });
  }
});
const updateTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.query.id;
  const { id: userId, role: userRole } = req.user; // Destructuring để làm code gọn gàng hơn
  const transaction = await TransactionModel.findById(transactionId);

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (userId === transaction.owner.toString() || userRole === "admin") {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction, // Trả về chi tiết đã cập nhật
    });
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized to update this transaction" });
  }
});
const getTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.query.id;
  let updateTransactionDetails;
  const transaction = await TransactionModel.findById(transactionId).populate(
    "owner",
    { password: 0 }
  );
  const transactionDetails = await TransactionDetailModel.find({
    transactionId: transactionId,
  }).populate("user", { password: 0 });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  if (transaction.type == "uneven") {
    const discountPercent = transaction.discount / transaction.amount;
    updateTransactionDetails = transactionDetails.map((detail) => ({
      ...detail.toObject(),
      debitAmount: detail.moneyDetail * (1 - discountPercent),
    }));
  } else if (transaction.type == "uniform") {
    const debitAmount = transaction.amount / transactionDetails.length;
    updateTransactionDetails = transactionDetails.map((detail) => ({
      ...detail.toObject(),
      debitAmount,
    }));
  }

  return res.status(200).json({
    message: "Transaction found",
    transaction,
    detail: updateTransactionDetails,
  });
});

const transactionController = {
  createTransaction,
  updateTransactionDetail,
  updateTransaction,
  getTransaction,
};

export default transactionController;
