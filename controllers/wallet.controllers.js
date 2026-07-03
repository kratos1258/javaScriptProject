const mongoose = require("mongoose");
const User = require("../models/user.model");
const Wallet = require("../models/wallet.model");


const createWallet = async (req,res) => {
    const { id } = req.user;
    const {phoneNum} = req.body;
    try {
        if(!phoneNum) {
            return res.status(400).json({message: "Phone number is required"});
        }
        console.log("user ID: ", id);
        const user = await User.findById(id);
        if(!user) {
            return res.status(400).json({message: "User not found"});
        }
        user.phoneNum = phoneNum
        await user.save();

        const existingWallet = await Wallet.findOne({userId: id});
        if (existingWallet) {
            return res.status(400).json({message: "Wallet already exist"})
        }

        const wallet = new Wallet({
            userId: user._id,
            accountNumber: phoneNum.slice(-10)
        });
        await wallet.save();

        return res.status(201).json({message: "Wallet created Successfully", wallet})

    } catch (error) {
        console.log("Wallet cannot be created", error);
        return res.status(500).json({message: "Internal sever error"});
        
    }


}

const getWallet = async (req,res) => {
    const {id} = req.user;
    try {
        const wallet = await Wallet.findOne({ userId: id});
        if (!wallet) {
            return res.status(400).json({message: " wallet not found"});
        }
        return res.status(200).json({message: "Lists of wallets: ", wallet})
    } catch (error) {
        console.log(e)
        return res.status(500).json({message: "Internal server error"});
        
    }
}

const creditWallet = async (req, res) => {
    const { id } = req.user;
    const { amount } = req.body;

    try {
        const parsedAmount = Number(amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }

        const amountDecimal = mongoose.Types.Decimal128.fromString(parsedAmount.toFixed(2));

        const wallet = await Wallet.findOneAndUpdate(
            { userId: id },
            { $inc: { balance: amountDecimal } },
            { new: true }
        );

        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        return res.status(200).json({ message: "Wallet credited successfully", wallet });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const debitWallet = async (req, res) => {
    const { id } = req.user;
    const { amount } = req.body;

  
    try {
        const parsedAmount = Number(amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }

        const amountDecimal = mongoose.Types.Decimal128.fromString(parsedAmount.toFixed(2));
        const negativeAmountDecimal = mongoose.Types.Decimal128.fromString((-parsedAmount).toFixed(2));

        const wallet = await Wallet.findOneAndUpdate(
            {
                userId: id,
                balance: { $gte: amountDecimal }
            },
            { $inc: { balance: negativeAmountDecimal } },
            { new: true }
        );

        if (!wallet) {
            return res.status(400).json({ message: "Insufficient balance or wallet not found" });
        }

        return res.status(200).json({ message: "Wallet debited successfully", wallet });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const transfer = async (req,res) => {
    const {id} = req.user;
    const{recepientAccountNumber, amount} = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!recepientAccountNumber || !amount || amount <=0){
            await session.abortTransaction();
            return res.status(400).json({message:"Acoount number and Amount required And amount must be more than zero"})
        }
        const senderWallet = await Wallet.findOne({userId: id}).session(session);
        if (!senderWallet) {
            await session.abortTransaction();
            return res.status(400).json({message: "Invalide wallet"});
        }
        if (parseFloat(senderWallet.balance) < parseFloat(amount)) {
            await session.abortTransaction();
            return res.status(400).json({message: " Insufficient balance"});
        }

        const recepientWallet =  await Wallet.findOne({accountNumber: recepientAccountNumber}).session(session);
        if (!recepientAccountNumber) {
            await session.abortTransaction();
            return res.status(400).json({message: "Wallet not found"});
        }

        //perform the transaction
        await Wallet.findOneAndUpdate(
            {userId: id}, 
            {$inc: {balance: -parseFloat(amount)}},
            { session, new: true});

        await Wallet.findOneAndUpdate(
            {accountNumber: recepientAccountNumber},
            {$inc: {balance: parseFloat(amount)}},
            {session, new: true}
        );
        await session.commitTransaction();
        return res.status(200).json({message: "Transfer completed successfully"});
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({message: "Internal server error"})
        console.log(error);
        
    }   finally {
        session.endSession();
    }
}

module.exports = {createWallet,getWallet,creditWallet,debitWallet, transfer};