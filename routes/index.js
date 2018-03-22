
var express = require('express');
var router = express.Router();
var path = require('path');

var mysql = require('mysql');

/* define connecition  */

var con = mysql.createConnection({
  host: "mysql://mysql:3306/",
  user: "ShoppingList",
  password: "zxcasd",
  database: "mydb"
  
});


con.connect(function(err) {
  if (err) throw err;});


 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});

/* GET showList page. */
router.get('/showList', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'views', 'showList.html'));
});


router.get('/getUserID', function(req,res){

  con.query("SELECT userID FROM users WHERE (username='"+req.query.username+"' AND password='"+req.query.password+"');", function (err, result, fields) {
    if (err) throw err;
   
    
    result=JSON.stringify(result);
    console.log(result)
    res.send(result);
    

  })
});

router.get('/getSharedUsers', function(req,res){

  con.query("SELECT username,role FROM users INNER JOIN list_user ON users.userID=list_user.userID WHERE listID="+req.query.listID+";", function (err, result, fields) {
    if (err) throw err;
   
    
    result=JSON.stringify(result);
    console.log(result)
    res.send(result);
    

  })
});

router.get('/shareWithUsername', function(req,res){
  var waterfall=require('async-waterfall');

  waterfall([
    function(callback){
     
      var sql="SELECT userID FROM users WHERE username='"+req.query.username+"';";
      var userID=0;
    
      con.query(sql, function (err, result) {
        if (err) throw err;
  
        
       
        if (result.length == 0)
        {
          callback(null,null);}
        
        else{
       
        userID=result[0].userID;
        callback(null,userID);

        }

      });

      
      
    },

    function(userID,callback){
      
      if (userID == null)
      { res.send('0');
        callback(null,'user doesnt exist');}

      else {
        var sql="INSERT INTO list_user (listID, userID,role) VALUES ("+req.query.listID+","+userID+",'edit');";
     
        con.query(sql, function (err, result) {
          if (err) throw err;
    
          console.log('listID:'+req.query.listID+' is now shared with userID:'+userID);
          res.send('1');
          callback(null,'done');
        });
        
      }
    

      
    }
  
  ], 
    
    
     function(err,result){
        console.log(result)
       
     }

    );

});


router.get('/getCategories', function(req,res){

  con.query("SELECT * FROM cat_list INNER JOIN categories ON cat_list.categoryID=categories.categoryID WHERE listID='"+req.query.listID+"';", function (err, result, fields) {
    if (err) throw err;
   console.log(result)
    
    result=JSON.stringify(result);
    console.log(result)
    res.send(result);
    

  })





});


// get lists 

router.get('/getLists', function(req,res){

  con.query("SELECT * FROM list_user INNER JOIN lists ON list_user.listID=lists.listID WHERE userID='"+req.query.userID+"';", function (err, result, fields) {
    if (err) throw err;
   
    
    result=JSON.stringify(result);
    console.log('list connected to user loaded')
    res.send(result);
    

  })





});


router.get('/getItems', function(req,res){

      con.query("SELECT * FROM items INNER JOIN cat_list on cat_list.categoryID=items.underCategory WHERE listID='"+req.query.listID+"';", function (err, result, fields) {
        if (err) throw err;
       
        
        result=JSON.stringify(result);
      
        res.send(result);
        
    
      })
    

  
  
 
});

router.post('/addItem', function(req,res){

  var newitem = {
    "itemID":6,
    "itemName":req.body.itemName,
    "itemNotes":"",
    "important":0,
    "bought":0,
    "nofind":0,
    "dateCreated":"9999-12-31 23:59:59",
    "underCategory":req.body.categoryID,
    "createdBy":req.body.userID
    }
  
  
  var sql="INSERT INTO items (itemName, itemNotes, important, bought, nofind, datecreated, underCategory, createdBy) VALUES ('" + newitem.itemName +"', '" + newitem.itemNotes +"', '" + newitem.important +"', '" + newitem.bought +"', '" + newitem.nofind +"', '" + newitem.dateCreated +"', '" + newitem.underCategory +"', '" + newitem.createdBy + "'" +");";
  con.query(sql, function (err, result) {
  if (err) throw err;

  

  res.send(result)
    
   
  });

});

router.post('/deleteItem', function(req,res){
  
  
  

  
  var sql="DELETE FROM items WHERE itemID='"+req.body.itemID+"';";
  con.query(sql, function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});



router.post('/deleteCategory', function(req,res){
  
  
  

  
  var sql="DELETE FROM categories WHERE categoryID='"+req.body.categoryID+"';";
  con.query(sql, function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});

router.post('/deleteList', function(req,res){
  
  
  

  
  var sql="DELETE FROM lists WHERE listID='"+req.body.listID+"';";
  con.query(sql, function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});



router.post('/editItem', function(req,res){
  
  
  var item = {
    "itemID":req.body.itemID,
    "itemNotes":req.body.itemNotes,
    "itemName":req.body.itemName,
    "important:":req.body.important

    };
    console.log("item")

  
  var sql="UPDATE items SET itemNotes= ?, itemName= ?, important = ? WHERE itemID= ?";
  con.query(sql,[item.itemNotes,item.itemName,item.important,item.itemID], function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});


    

router.post('/bought', function(req,res){
  
  
  var item = {
    "itemID":req.body.itemID,
    "bought":req.body.bought

    };
    console.log("item")

  
  var sql="UPDATE items SET bought= '"+item.bought +"', nofind=0 WHERE itemID= '"+item.itemID+"';";
  con.query(sql, function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});
    



router.post('/nofind', function(req,res){
  
  
  var item = {
    "itemID":req.body.itemID,
    "nofind":req.body.nofind

    };
    console.log("item")

  
  var sql="UPDATE items SET nofind= '"+item.nofind +"',bought=0 WHERE itemID= '"+item.itemID+"';";
  con.query(sql, function (err, result) {
  if (err) throw err;
  
console.log(result)
  res.send(result)
    
   
  });

});






router.post('/addList', function(req,res){
  
  var waterfall=require('async-waterfall');

  waterfall([
    function(callback){
      var sql="INSERT INTO lists (listName) VALUES (?);";
      var newListID=0;
    
      con.query(sql,req.body.listName, function (err, result) {
        if (err) throw err;
  
        console.log(result)
       
        
        
        newListID=result.insertId;
        
        callback(null,newListID);
      });

      
      
    },

    function(newListID,callback){
      
      var sql="INSERT INTO list_user (listID, userID,role) VALUES ("+newListID+","+req.body.userID+",'admin');";
     
      con.query(sql, function (err, result) {
        if (err) throw err;
  
        console.log(result)
        res.send(result)
        callback(null,'done');

        
      });

      
    }
  
  ], 
    
    
     function(err,result){
        console.log(result)
     }


  );


  
   

    

  

});





router.post('/addCategory', function(req,res){
  
  var waterfall=require('async-waterfall');

  waterfall([
    function(callback){
      var sql="INSERT INTO categories (categoryName, createdBY ) VALUES ('" + req.body.categoryName + "','"+req.body.userID+"');";
      var newCatID=0;
    
      con.query(sql, function (err, result) {
        if (err) throw err;
  
        
        console.log(result)
        
        
        newCatID=result.insertId;
        
        callback(null,newCatID);
      });

      
      
    },

    function(newCatID,callback){
      
      var sql="INSERT INTO cat_list (categoryID,listID) VALUES ("+newCatID+","+req.body.listID+");";
     
      con.query(sql, function (err, result) {
        if (err) throw err;
  
        console.log(result)
        res.send(result)
       
        callback(null,'done');

       
      });

      
    }
  
  ], 
    
    
     function(err,result){
        console.log(result)
     }


  );


  
   

    

  

});



module.exports = router;