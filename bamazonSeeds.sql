CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products(
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NULL,
    department_name VARCHAR(50) NULL,
    price INT NULL,
    stock_quantity INT NULL,
    PRIMARY KEY (item_id)
);
INSERT INTO products 
(product_name,department_name,price,stock_quantity)
VALUES
("scissors","home",3,18),
("cups","home",5,20),
("handbag","accesories",40,5),
("scarf","accesories",15,15),
("control remote","electronics",35,10),
("batteries","electronics",17,30),
("post it notes","office",8,89),
("erasers","office",1.5,45),
("polos","clothing",35,10),
("blouse","clothing",55,6);


