const express=require('express');
const router=express.Router();
const db=require('../db');

router.post("/addCategory", (req, res) => {
  const { categoryName } = req.body;
  const query = `insert into category(categoryName) values(?)`;
  db.query(query, [categoryName], (error, result) => {
    if (error) {
      console.error("Error inserting data", error);
      res.status(500).send("Error inserting data");
    } else {
      console.log("Data inserted successfully");
      res.status(200).send(result);
    }
  });
});

router.get("/getAllCategories", (req, res) => {
  const query = `select * from category`;
  db.query(query, (error, result) => {
    if (error) {
      console.log("Something went wrong", error);
      res.status(500).send("Something went wrong");
    } else {
      console.log("ok");
      res.status(200).send(result);
    }
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = `select * from category where id=?`;
  db.query(query, [id], (error, result) => {
    if (error) {
      console.error("Something went wrong", error);
      res.status.send(500).send("Something went wrong");
    } else {
      console.log("okk");
      res.status(200).send(result[0]);
    }
  });
});

router.post("/update/:id", (req, res) => {
  const id = req.params.id;
  const { categoryName } = req.body;
  const query = `update category set categoryName=? where id=?`;
  db.query(query, [categoryName, id], (error, result) => {
    if (error) {
      console.error("Something wentt wrong", error);
      res.status(500).send("Something wentt wrong");
    } else {
      console.log("okkk");
      res.status(200).send(result);
    }
  });
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM category WHERE id = ?`;
  db.query(query, [id], (error, result) => {
    if (error) {
      console.error(`something went wrong`, error);
      res.status(500).send("something went wrong");
    } else {
      console.log("okkk");
      res.status(200).send(result);
    }
  });
});

module.exports=router;