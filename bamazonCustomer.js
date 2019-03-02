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

// //Connect to MySql and run function
connection.connect(function(err){
    if(err) throw err;
    console.log("Connected as ID " + connection.threadId);
    displayItems();
    // connection.end();
    // test(1);

})

function displayItems() {
    connection.query("SELECT item_id,product_name,price FROM products", function(err,res){
        if(err) throw err;
        console.log("\nItem ID| Product   | Price");
        console.log("--------------------------");
        for(var i = 0;i<res.length;i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price);
        }

        placeOrder();
        // test(1);
    })
}


function placeOrder(){
    inquirer.prompt([{
        name:"id",
        type:"input",
        message:"Which product would you like to buy? Choose the ID"
    } , {
        name:"units",
        type:"input",
        message:"How many would you like?"
    }]).then(function(answer){
        var query = "SELECT product_name,price,stock_quantity FROM products WHERE ?";
        connection.query(query,{item_id: answer.id},function(err,res){
            if(err) throw err;
            if(res[0].stock_quantity < answer.units) {
                console.log("Insufficient quantity!");
            } else {
                var updateQuant = res[0].stock_quantity - answer.units;
                // console.log(updateQuant);
                updateInventory(updateQuant,answer.id,answer.units);
                console.log("Lets buy");
            }
        });
        
    });
};

function updateInventory(arg1,arg2,arg3) {
    var query = "UPDATE products SET ? WHERE item_id = 1";
    connection.query(query,{stock_quantity: arg1},function(err){
        if(err) throw err;
        var query = "SELECT price FROM products WHERE ?";
        connection.query(query,{item_id: arg2},function(err,res){
            if(err) throw err;
            var totalPrice = res[0].price * arg3;
            // console.log(totalPrice);
            console.log("The cost of your puschase is $" + totalPrice);
            
        });
    })
}

function test(arg) {
    var query = "SELECT price FROM products WHERE ?";
    console.log(arg);
        connection.query(query,{item_id: "1"},function(err,res){
            if(err) throw err;
            console.log(res);
        });
}
