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
    managerOptions();    
})

function managerOptions() {
    inquirer.prompt({
        name:'action',
        type:'rawlist',
        message:'What would you like to do?',
        choices:[
            'View Products for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product'
        ]
    }).then(function(answ){
        switch(answ.action){
            case 'View Products for Sale':
                viewProducts();
                break;
            case 'View Low Inventory':
                viewInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case "exit":
                connection.end();
                break;
        }
    })
};

//List every available item: the item IDs, names, prices, and quantities.
function viewProducts() {
    connection.query("SELECT item_id,product_name,price,stock_quantity FROM products", function(err,res){
        if(err) throw err;
        console.log("Items in stock");
        console.log("\nItem ID| Product   | Quantity    | Price");
        console.log("-------------------------------------------");
        for(var i = 0;i<res.length;i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].stock_quantity + " | $" + res[i].price);
        }
        console.log("-------------------------------------------");
        managerOptions();
    })
};

//List items with an inventory count lower than five.
function viewInventory() {
    connection.query("SELECT item_id,product_name,price,stock_quantity FROM products WHERE stock_quantity < 5", function(err,res){
        if(err) throw err;
        console.log("Items with low inventory");
        console.log("\nItem ID| Product   | Quantity    | Price");
        console.log("-------------------------------------------");
        for(var i = 0;i<res.length;i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].stock_quantity + " | $" + res[i].price);
        }
        console.log("-------------------------------------------");
        managerOptions();
    })
};

//Display a prompt that will let the manager "add more" of any item currently in the store.
function addInventory(){
    inquirer.prompt({
        name:"addProd",
        type: "confirm",
        message: "Would you like to add more items af a product?"
    }).then(function(answ){
        if (answ.addProd == false) {
            console.log("No problem, main menu.")
            managerOptions();
        } else {
            inquirer.prompt({
                name: "product",
                type:"input",
                message: "Which product number should we update?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
            }).then(function(answer){
                checkID(answer.product);
            });
        }
    });
};

//Helper function to check if manager typed an existing ID
function checkID(arg) {
    connection.query("SELECT item_id FROM products", function(err,res) {
        if (err) throw err; 
        if (arg > res.length) {                
            console.log("No product with that number ID. Choose another one.");
            addInventory();
        } else {
            inquirer.prompt({
                name:"units",
                type:"input",
                message:"How many would you like to add?"
            }).then(function(answer){
                //Add stock to the inventory
                var query = "SELECT product_name,stock_quantity FROM products WHERE ?";
                connection.query(query,{item_id: arg},function(err,res){
                    if(err) throw err;
                    var unitNumber = parseInt(answer.units);
                    var updateInvent = res[0].stock_quantity + unitNumber;
                    updateInventory(updateInvent,arg);
                });                    
            });  
        }      
    });
};

//Function to add stock to the inventory
function updateInventory(arg1,arg2) {
    var query = "UPDATE products SET ? WHERE ?";
    connection.query(query,[{stock_quantity: arg1},{item_id: arg2}],function(err){
        if(err) throw err;
        var query = "SELECT product_name,stock_quantity FROM products WHERE ?";
        connection.query(query,{item_id: arg2},function(err,res){
            if(err) throw err;
            console.log("There are now " + res[0].stock_quantity + " units of " + res[0].product_name);
            managerOptions();        
        });
    })
}

//Allow the manager to add a completely new product to the store.
function addProduct() {
    inquirer.prompt([{
        name: "newProd",
        type:"input",
        message:"Which product would you like to add?"
    },{
        name: "departm",
        type:"input",
        message:"What is the department of this item?"
    }, {
        name: "price",
        type:"input",
        message:"How much does this item cost?"
    }, {
        name: "stockQuant",
        type:"input",
        message:"How many units are we adding to the inventory?"
    }]).then(function(answer){
        var query = "INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES (?,?,?,?)";
        var valToAdd = [answer.newProd, answer.departn, answer.price, answer.stockQuant];
        connection.query(query, valToAdd, function(err,res){
            if(err) throw err;
            console.log("Product added");
            viewProducts();
            managerOptions();
        })   
    })
};
