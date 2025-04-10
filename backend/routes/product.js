const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // Upload destination
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage: storage });

// ✅ Fetch all products (with optional search)
router.get("/all", (req, res) => {
  const searchString = req.query.s;
  let query = "SELECT * FROM products";
  let values = [];

  if (searchString) {
    query += " WHERE title LIKE ?";
    values.push(`%${searchString}%`);
  }

  db.query(query, values, (error, result) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
    res.status(200).json(result);
  });
});

// ✅ Fetch a single product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM products WHERE product_id = ?",
    [id],
    (error, result) => {
      if (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(result[0]);
    }
  );
});

// ✅ Fetch products by category
router.get("/category/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM products WHERE categoryId = ?",
    [id],
    (error, result) => {
      if (error) {
        console.error("Error fetching category products:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      res.status(200).json(result);
    }
  );
});

// ✅ Add a new product
router.post("/add", upload.single("productImage"), (req, res) => {
  const { title, description, price, stock, categoryId } = req.body;
  const filename = req.file?.filename;

  const query = `INSERT INTO products (title, description, price, stock, categoryId, productImage) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [title, description, price, stock, categoryId, filename],
    (error, result) => {
      if (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      res
        .status(201)
        .json({
          message: "Product added successfully",
          productId: result.insertId,
        });
    }
  );
});

// ✅ Update a product
router.post("/update/:id", upload.single("productImage"), (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock } = req.body;
  const filename = req.file?.filename;

  const query = `UPDATE products SET title = ?, description = ?, price = ?, stock = ?, productImage = ? WHERE product_id = ?`;

  db.query(
    query,
    [title, description, price, stock, filename, id],
    (error, result) => {
      if (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product updated successfully" });
    }
  );
});

// ✅ Delete a product
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM products WHERE product_id = ?",
    [id],
    (error, result) => {
      if (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No product found with the specified ID" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    }
  );
});

module.exports = router;
