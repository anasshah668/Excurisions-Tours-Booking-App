import express from "express";
import Stripe from "stripe";
import { config } from "dotenv";
import { protect } from "../shared/common.js";

config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const amountPKR = Number(req.body.amount);
    const currency = req.body.currency.toLowerCase();

    if (currency !== "pkr") {
      return res.status(400).json({ error: "Only PKR is supported" });
    }
    const amountUSD = amountPKR / 278;
    const amountInCents = Math.round(amountUSD * 100);
    if (amountUSD < 0.5) {
      return res.status(400).json({
        error: `Amount must convert to at least $0.50. ₨${amountPKR} ≈ $${amountUSD.toFixed(
          2
        )}.`,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      usdAmount: amountUSD.toFixed(2),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Something went wrong with payment creation." });
  }
});

export default router;
