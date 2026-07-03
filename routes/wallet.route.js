const express = require("express");
const router = express.Router();
const {createWallet, getWallet, creditWallet, debitWallet, transfer} = require("../controllers/wallet.controllers");
const isAuthentication = require("../utils/isAuthentication");



router.post("/createWallet",isAuthentication, createWallet);
router.get("/wallets", isAuthentication,getWallet);
router.post("/credit", isAuthentication,creditWallet);
router.post("/debit", isAuthentication, debitWallet);
router.post("/transfer", isAuthentication, transfer)

module.exports = router;