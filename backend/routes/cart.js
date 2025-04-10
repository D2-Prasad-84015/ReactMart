const express = require("express");
const router = express.Router();
const db = require("../db");

// 🔹 Save Cart
router.post("/saveCart", (req, res) => {
  const { cartItems } = req.body;
  console.log(cartItems);

  if (cartItems.cartItems.length > 0) {
    const values = cartItems.cartItems.map((item) => [
      req.user.id,
      item.product_id,
      item.quantity,
      item.price,
    ]);
    console.log(values);

    const query = `INSERT INTO cart (user_id, product_id, quantity, price)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      quantity = VALUES(quantity),
      price = VALUES(price);`;

    db.query(query, [values], (error, result) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).send("Error inserting data");
      }
      console.log("Data inserted successfully");
      res.status(200).send(result);
    });
  }
});

// 🔹 Create Order
router.post("/createOrder", (req, res) => {
  const { cartItems, totalCost } = req.body;
  console.log("cartItems=>", cartItems);
  console.log("totalCost=>", totalCost);

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const query1 = "INSERT INTO orders (user_id, total_cost) VALUES (?, ?)";
  db.query(query1, [req.user.id, totalCost], (error, orderResult) => {
    if (error) {
      console.error("Order creation failed:", error);
      return res.status(500).json({ error: "Failed to place order" });
    }

    const orderId = orderResult.insertId;
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES ?
    `;
    const orderItemsValues = cartItems.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
      item.total,
    ]);

    db.query(orderItemsQuery, [orderItemsValues], (error, result) => {
      if (error) {
        console.error("Error inserting order items:", error);
        return res.status(500).json({ error: "Failed to add order items" });
      }
      res.status(201).json({ message: "Order placed successfully", orderId });
    });
  });
});

router.post("/updateOrderStatus/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  console.log("productId=>", orderId);
  const { status } = req.body;

  const query = "update orders set status =? WHERE order_id = ?";
  db.query(query, [status, orderId], (error, result) => {
    if (error) {
      console.error("Error while update order status", error);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows > 0) {
      console.log("order status updated successfully");
      res.status(200).json({ message: "Order Status Updated" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  });
});

// 🔹 Get Orders
router.get("/getOrders", (req, res) => {
  const query = "SELECT * FROM orders WHERE user_id = ?";
  db.query(query, [req.user.id], (error, result) => {
    if (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Error while fetching orders" });
    }
    res.status(200).send(result);
  });
});

// 🔹 Get all Orders
router.get("/getAllOrders", (req, res) => {
  const query = "SELECT * FROM orders";
  db.query(query, [], (error, result) => {
    if (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Error while fetching orders" });
    }
    res.status(200).send(result);
  });
});

// 🔹 Get Order Items
router.get("/getOrderItems/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  const query = "SELECT * FROM order_items WHERE order_id = ?";

  db.query(query, [orderId], (error, result) => {
    if (error) {
      console.error("Error fetching order items:", error);
      return res.status(500).json({ error: "Error while fetching orders" });
    }
    res.status(200).send(result);
  });
});

// 🔹 Remove From Cart
router.post("/removeFromCart/:productId", (req, res) => {
  const productId = req.params.productId;
  console.log("productId=>", productId);

  const query = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(query, [req.user.id, productId], (error, result) => {
    if (error) {
      console.error("Error deleting item from cart:", error);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows > 0) {
      console.log("Item removed successfully");
      res.status(200).json({ message: "Item removed from cart" });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  });
});

router.post("/emptyCart", (req, res) => {
  const query = "DELETE FROM cart WHERE user_id = ?";
  db.query(query, [req.user.id], (error, result) => {
    if (error) {
      console.error("Error deleting items from cart:", error);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows > 0) {
      console.log("cart empty successfully");
      res.status(200).json({ message: "Items removed from cart" });
    }
  });
});

// 🔹 Fetch Cart
router.get("/fetchCart", (req, res) => {
  console.log("Inside fetching Cart");

  const query = "SELECT * FROM cart WHERE user_id = ?";
  db.query(query, [req.user.id], (error, result) => {
    if (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).send(result);
  });
});

module.exports = router;
