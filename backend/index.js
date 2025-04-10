const express = require("express");
const cors = require("cors");

const router = express.Router();
const db = require("./db");

const jwt = require("jsonwebtoken");
const config = require("./config");

// create express app
const app = express();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static("images"));
app.use(express.json()); //for body parser
app.use(express.urlencoded({ extended: true }));
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//Middle Ware

app.use((req, res, next) => {
  console.log(req.path);
  if (
    req.url === "/user/register" ||
    req.url === "/user/login" ||
    req.url === "/product/all" ||
    req.url === "/category/getAllCategories" ||
    req.url.match(/^\/product\/\d+$/) ||
    req.url.match(/([\w-]+\.(jpg|png|jpeg))/) ||
    req.url.match(/\/product\/all\?s=([^&]+)/) ||
    req.url.match(/^\/product\/\d+$/) || 
    req.url.match(/^\/category\/\d+$/) 
  ) {
    console.log("inside login url");
    next();
  } else {
    console.log("inside else login url");
    const token = req.headers["x-token"];
    console.log("token=>",token);
    if (!token) {
      res.status(404).send("token missing");
    } else {
      try {
        const user = jwt.verify(token, config.key);
        req.user = user;
       
        next();
      
      } catch (ex) {
        res.status(500).send(ex);
      }
    }
  }
});

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const categoryRouter = require("./routes/category");
app.use("/category", categoryRouter);

const cartRouter = require("./routes/cart");
app.use("/cart", cartRouter);

const productRouter = require("./routes/product");
app.use("/product", productRouter);

// router.post('/register',(req,res)=>{
//   const { firstName,lastName,email,password,phoneNo,role,address}=req.body;
//   const query=`insert into user(firstName,lastName,email,password,phoneNo,role,address) values(?,?,?,?,?,?,?)`;
//   db.query(query,[firstName,lastName,email,password,phoneNo,role,address],(error,result)=>{
//     if(error){
//       console.error('error while inserting data',error);
//       res.status(500).send('error while inserting data')
//     }
//     else{
//       console.log('register successfully');
//       res.status(200).send(result);
//     }
//   })

// });

// router.post('/login',(req,res)=>{
//   const { email,password}=req.body;
//   const query=`select * from user where email=? and password=?`;
//   db.query(query,[email,password],(error,result)=>{
//     if(error){
//       console.error('error inserting data',error);
//       res.status(500).send('error inserting data');

//     }else{
//       console.log('lagin successfully');
//       res.status(200).send(result);
//     }
//   })
// })

app.use(router);

app.listen(4000, () => {
  console.log("app started on port 4000");
});
