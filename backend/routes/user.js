const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
const config = require("../config");

// 🔹 Register User
router.post("/register", (req, res) => {
  const { firstName, lastName, email, password, phoneNo, role, address } =
    req.body;
  const encryptPass = String(crypto.SHA1(password)); // Hash the password

  const query = `INSERT INTO user (firstName, lastName, email, password, phoneNo, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [firstName, lastName, email, encryptPass, phoneNo, role, address],
    (error, result) => {
      if (error) {
        console.error("Error while registering user:", error);
        return res.status(500).json({ error: "Error registering user" });
      }
      res
        .status(201)
        .json({
          message: "User registered successfully",
          userId: result.insertId,
        });
    }
  );
});

// 🔹 Login User
router.post("/login", (req, res) => {
  console.log("Inside login");
  const { email, password } = req.body;
  const encryptPass = String(crypto.SHA1(password)); // Hash the password

  const query = `SELECT * FROM user WHERE email = ? and password = ?`;
  db.query(query, [email, encryptPass], (error, result) => {
    if (error) {
      console.error("Error during login:", error);
      return res.status(500).send("Something went wrong");
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];
    const { firstName, lastName, role, id } = user;
    const token = jwt.sign({ firstName, lastName, role, id }, config.key, {
      expiresIn: "1h",
    });
    console.log("Token:", token);

    res.status(200).json({ token, role });
  });
});

// 🔹 Get My Profile (Protected Route)
router.get("/myProfile", (req, res) => {
  const query = `SELECT id, firstName, lastName, email, phoneNo, role, address FROM user WHERE id = ?`;
  db.query(query, [req.user.id], (error, result) => {
    if (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result[0]);
  });
});

// 🔹 Get All Users
router.get("/all", (req, res) => {
  const query = `SELECT id, firstName, lastName, email, phoneNo, role, address FROM user`;
  db.query(query, [], (error, result) => {
    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
    res.status(200).json(result);
  });
});

// 🔹 Update User Profile (Protected Route)
router.post("/update", (req, res) => {
  const { firstName, lastName, email, phoneNo, address } = req.body;

  const query = `UPDATE user SET firstName = ?, lastName = ?, email = ?, phoneNo = ?, address = ? WHERE id = ?`;
  db.query(
    query,
    [firstName, lastName, email, phoneNo, address, req.user.id],
    (error, result) => {
      if (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Something went wrong" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ message: "Profile updated successfully" });
    }
  );
});

module.exports = router;
