// routes/productRoutes.js
import express from "express";
import Product from "../models/ProductModel.js";

const router = express.Router();

router.post("/showProduct", async (req, res) => {
  try {
    const { productName, productPrice, productUrl } = req.body;

    // Build dynamic filter
    const filter = {};

    if (productName && productName.trim() !== "") {
      filter.productName = { $regex: productName, $options: "i" }; // Case-insensitive search for product name
    }

    // Check if productPrice is provided and not zero
    if (productPrice && productPrice !== 0) {
      // Filter products with price less than or equal to the provided value
      filter.productPrice = { $lte: productPrice };
    }

    if (productUrl && productUrl.trim() !== "") {
      filter.productUrl = { $regex: productUrl, $options: "i" }; // Case-insensitive search for product URL
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/UpsertProduct", async (req, res) => {
  try {
    const { id, productName, productPrice, productUrl } = req.body;

    // Validate common required fields
    if (!productName || !productPrice || !productUrl) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!id) {
      // ADD case
      const newProduct = new Product({
        productName,
        productPrice,
        productUrl,
      });

      const savedProduct = await newProduct.save();
      return res
        .status(201)
        .json({ success: true, message: "Product added", data: savedProduct });
    } else {
      // UPDATE case
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          productName,
          productPrice,
          productUrl,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated",
        data: updatedProduct,
      });
    }
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/deleteProduct", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
