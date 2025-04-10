create database ecartapp;

use ecartapp;

create table user(
  id int primary key auto_increment,
  firstName varchar(100),
  lastName varchar(100),
  email varchar(100),
  password varchar(100),
  phoneNo varchar(20),
  role varchar(20),
  address varchar(100),
  createdAt timestamp default CURRENT_TIMESTAMP
);

create table category(
  id int primary key auto_increment,
  categoryName varchar(100),
  createdAt timestamp default CURRENT_TIMESTAMP
);

create table products(
  product_id int primary key auto_increment,
  title varchar(100),
  description varchar(1024),
  price float,
  stock int,
  categoryId int , foreign key(categoryId) references category(id),
  productImage varchar(500),
  createdAt timestamp default CURRENT_TIMESTAMP
);

CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,       
    user_id INT NOT NULL,                         
    product_id INT NOT NULL,                      
    quantity INT NOT NULL DEFAULT 1,             
    price DECIMAL(10, 2) NOT NULL,               
    total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES user(id), 
    FOREIGN KEY (product_id) REFERENCES products(product_id) 
);
-- for unique userId and productId combo
alter table cart add unique(user_id,product_id);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Shipped', 'Delivered','Cancelled') DEFAULT 'Pending'
);
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

select * from user;
select * from category;
select * from products;
select * from orders;
select * from cart;
select * from order_items;