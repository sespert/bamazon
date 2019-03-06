//Packages required
var mysql = require("mysql");
var inquirer = require("inquirer");

//Create connection with MySql
var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password:"sher123",
    database:"bamazon"
});

//Connect to MySql and run function
connection.connect(function(err){
    if(err) throw err;
    console.log("Connected as ID " + connection.threadId);
    displayItems();
})

//Display all of the items available for sale
function displayItems() {
    connection.query("SELECT item_id,product_name,price FROM products", function(err,res){
        if(err) throw err;

        var itemsTable = [];

        for(var i = 0;i<res.length;i++) {
            itemsTable[i] = {
                ID: res[i].item_id,
                PRODUCT: res[i].product_name,
                PRICE: res[i].price
            };     
        }

        console.table(itemsTable);
        console.log("--------------------------");
        placeOrder();
    })
}

//Ask the user what item he wants to buy and how many.
function placeOrder(){
    inquirer.prompt({
        name:"id",
        type:"input",
        message:"Which product would you like to buy? Choose the ID",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
    }).then(function(answer) {
        checkID(answer.id);
    });
};

//Helper function to check if user typed an existing ID
function checkID(arg) {
    connection.query("SELECT item_id, product_name FROM products", function(err,res) {
        if (err) throw err;
        if (arg > res.length) {                
            console.log("No product with that number ID. Choose another one.");
            placeOrder();
        } else {
            console.log("OK! Let's buy some " + res[arg-1].product_name);
            inquirer.prompt({
                name:"units",
                type:"input",
                message:"How many would you like?"
            }).then(function(answer){
                //Once the customer has placed the order check if the store has enough of the product to meet the customer's request.
                var query = "SELECT product_name,price,stock_quantity FROM products WHERE ?";
                connection.query(query,{item_id: arg},function(err,res){
                    if(err) throw err;
                    if(res[0].stock_quantity < answer.units) {
                        console.log("Insufficient quantity!");
                        placeOrder();
                    } else {
                        var updateQuant = res[0].stock_quantity - answer.units;
                        updateInventory(updateQuant,arg,answer.units);
                    }
                });                    
            });  
        }      
    });
}


//If enough inventory, fulfill the customer's order and update database.
function updateInventory(arg1,arg2,arg3) {
    var query = "UPDATE products SET ? WHERE ?";
    connection.query(query,[{stock_quantity: arg1}, {item_id: arg2}],function(err){
        if(err) throw err;
        var query = "SELECT price FROM products WHERE ?";
        connection.query(query,{item_id: arg2},function(err,res){
            if(err) throw err;
            var totalPrice = res[0].price * arg3;
            console.log("The cost of your purchase is $" + totalPrice);
            console.log("Thank you for shopping with us, we hope to see you again soon :)");
            connection.end();            
        });
    })
}
