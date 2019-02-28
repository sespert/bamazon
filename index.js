//Packages required
var mysql = require("mysql");
var inquirer = require("inquirer");

//Create connection with MySql
var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password:"yourPasswordHere",
    database:"bamazon"
});

// //Connect to MySql and run function
connection.connect(function(err){
    if(err) throw err;
    console.log("Connected as ID " + connection.threadId);
    displayItems();
    connection.end();
})

function displayItems() {
    connection.query("SELECT item_id,product_name,price FROM products", function(err,res){
        if(err) throw err;
        console.log("\nItem ID| Product   | Price");
        console.log("--------------------------");
        for(var i = 0;i<res.length;i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price);
        }
        
    })
}

