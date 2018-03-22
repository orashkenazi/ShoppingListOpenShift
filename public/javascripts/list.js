var app = angular.module("ShoppingList", []);

app.controller("myList", function($scope, $http, $timeout) {
    //$scope.showNotes= [];       delete it   
    $scope.debug=0; //sometimes used for debugging  

    $scope.username=''; // for loginbox
    $scope.password=''; // for loginbox
    
    $scope.editItemOn= [];  // Array to determine which item is currently on edit-mode
    $scope.newItem = [];    // Array of the New items to add (each cell in the array refer to the input text of different list)
    $scope.newList = '';    // variable to conatine a new list to add
    $scope.products='initproducts'; // variable to contain all the products (sometime refered as items) of the current list on view.
    $scope.lists='initlsits'; // variable to contain all the list owned and shared by the user loggin in
    $scope.categories=[];   // variable to contain all the categories of the list in view
    $scope.user=''; //variable to store user id after login
    $scope.listID='';   //variable to store listID after list had been chosen
    $scope.listName='No List Chosen';   // variable to store listname after list had been chosen
    $scope.shareWith=[]; // array to store variable of users to add (each cell in the array refer to the text input of different list in MyLists)
    $scope.newCategory='';  //variable to store the new category to add
    

    $scope.shareError='';               //error messages for display
    $scope.addlistError='';             //error messages for display
    $scope.addCategoryError='';         //error messages for display
    $scope.addItemError='errorinit';    //error messages for display
    $scope.loginError='';               //error messages for display

    $scope.format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;    //formant for validating text
    $scope.imd=0;   //variable to help with with closing the edit-mod .. used to deteremine some cases of which the edit of the item will not be should not be closed by the blurring.



    $scope.inputMD = function(){                       
        $scope.imd=1
        $timeout(function(){$scope.imd=0}, 200);
        

    }

    
    $scope.inputBlurred = function(){
        
        
        $timeout(function(){
           

            if($scope.imd==1)

                {$scope.imd=0; 
                return;
            }
    
            else{
                $scope.editItemOn=[];
    
            }

        }, 0);

        
    }

    $scope.editClicked = function(index,pindex)
    {
      
     if (($scope.editItemOn[0]==index && $scope.editItemOn[1]==pindex)){
        
        $scope.editItemOn=[];
     }

     else{

        $scope.editItemOn=[index,pindex];
        $timeout(function(){angular.element(document.querySelector("#focus").focus());},200);
     }
     
    }
    
    $scope.tryLogin = function(){



        if($scope.username=='')
        {
            $scope.loginError="Please enter username";
            return;
        }

        if($scope.password=='')
        {   
            $scope.loginError="Please enter password";
            return;
        }

        if( $scope.format.test($scope.username))
        {   
             $scope.loginError="Special characters are not allowed.";
              return;
         }
         
         if( $scope.format.test($scope.password))
         {   
              $scope.loginError="Special characters are not allowed.";
               return;
          }
 
  

        $http({
            method: 'GET',
            url: '/getUserID',
            params: {
                username : $scope.username,
                password: $scope.password
                }
            
            }).then(function(response){ 

               if(response.data=='')
               {$scope.loginError="password doesn't matches, or username doesn't exist";}
                
               else {

                $scope.user = response.data[0].userID;
                $scope.getLists($scope.user);
               }
                
            });
        
   }
    
    $scope.chooseList = function(list)
    { 
        
       $scope.listID=list.listID;
       $scope.getCategories(list.listID);
       $scope.getItems(list.listID);
       $scope.listName=list.listName;
    
    }

    $scope.getLists = function(user)
    { 
        
        $http({
        method: 'GET',
        url: '/getLists',
        params: {userID : user}
        
        }).then(function(response){ 

            $scope.lists = response.data;

            for (i=0;i<$scope.lists.length;i++){   
                
                $scope.getSharedUsers($scope.lists[i].listID);

            }
            
            
        });

    }

    $scope.getSharedUsers = function(listID)
    { 
        
        $http({
        method: 'GET',
        url: '/getSharedUsers',
        params: {
                listID: listID    
        }
        
        }).then(function(response){ 

            for (i=0;i<$scope.lists.length;i++)
            {   
                if($scope.lists[i].listID==listID){

                $scope.lists[i].sharedUsers = response.data;
                }
            }
         
           
           
        });

    }
    
    $scope.shareWithUsername = function(username,list)
    { 
        if( $scope.format.test(username)){   
          
            $scope.shareError={"msg":"*Special characters are not allowed.", "listID":list.listID}; 
            
            $timeout(function(){$scope.shareError='';}, 3000);
            return;
        }


        if(username==$scope.username){
            
            $scope.shareError = {"msg":"You are the owner of this list...", "listID":list.listID};
            
            $timeout(function(){$scope.shareError='';}, 3000);
            return;
        }

        for(i=0;i<list.sharedUsers.length;i++){
            
            
            
            if(list.sharedUsers[i].username==username){   
                
                $scope.shareError = {"msg":"List is already shared with this user", "listID":list.listID};
                
                $timeout(function(){$scope.shareError='';}, 3000);
                return;
            }

        }

        $http({
        method: 'GET',
        url: '/shareWithUsername',
        params: {
                username : username,
                listID: list.listID    
        }
        
        }).then(function(response){ 

            if ( response.data==0)
            {
            $scope.shareError = {"msg":"Username doesn't exist", "listID":list.listID};
            
            $timeout(function(){$scope.shareError='';}, 3000);}

            if (response.data==1)
            {$scope.getLists($scope.user);}
           
        });

    }

    $scope.getCategories = function(list_id)
    { 
        
        $http({
        method: 'GET',
        url: '/getCategories',
        params: {listID : list_id}
        
        }).then(function(response){ 

            $scope.categories = response.data;
           
        });

    }

  
    $scope.getItems = function(list_id){
        
        
        $http.get('/getItems',{params :{listID : list_id}}).then(function(response) { $scope.products=response.data}); 
       
    }



    $scope.addItem = function(index,cat_id){
        
        if ($scope.newItem[index]==null || $scope.newItem[index]=='')
             { 
                $scope.addItemError={"msg":"*Please insert item name", "categoryID":cat_id}; 
                $timeout(function(){$scope.addItemError='';}, 3000);
                

                return;
            }

            if( $scope.format.test($scope.newItem[index]))
            {   
                $scope.addItemError={"msg":"*Special characters are not allowed.", "categoryID":cat_id}; 
                
                $timeout(function(){$scope.addItemError='';}, 3000);
                  return;
             }
              

        else{
            $http({
                method: 'POST',
                url: '/addItem',
                data: {
                    itemName : $scope.newItem[index],
                    categoryID: cat_id,
                    userID: $scope.user
                } ,
                headers: {'Content-Type': 'application/json'}
            });

            setTimeout(function(){$scope.getItems($scope.listID); $scope.newItem[index]='';}, 500);
        }
        
    }

    $scope.addList = function(userID,listName){
        if (listName==''){
            
            $scope.addlistError="*Please insert list name";
            $timeout(function(){$scope.addlistError='';}, 3000);
            return;
        }

      
            else {
                $http({
                    method: 'POST',
                    url: '/addList',
                    data: {
                        userID : userID,
                        listName: listName
                    } ,
                    headers: {'Content-Type': 'application/json'}
                }).then(function(){

                setTimeout(function(){ $scope.getLists($scope.user); $scope.newList='';}, 500);
                setTimeout(function(){ $scope.chooseList($scope.lists[$scope.lists.length-1]); }, 600);

                });
            }
    }

    $scope.shareList = function(userID,listID){
           

        $http({
            method: 'POST',
            url: '/shareList',
            data: {
                userID : userID,
                listID: listID
            } ,
            headers: {'Content-Type': 'application/json'}
        }).then(function(){

        setTimeout(function(){ $scope.getLists($scope.user);}, 500);
        

        });
    }

    $scope.addCategory = function(newCategory,listID){
       
        if (newCategory=='')
           { $scope.addCategoryError="*Please insert category name";
           $timeout(function(){$scope.addCategoryError='';}, 3000);
           return;
        }

        if($scope.format.test(newCategory))
        {   
             $scope.addCategoryError="Special characters are not allowed.";
             $timeout(function(){$scope.addCategoryError='';}, 3000);
              return;
         }

        else{
            $http({
                method: 'POST',
                url: '/addCategory',
                data: {
                    listID : listID,
                    categoryName: newCategory,
                    userID: $scope.user
                } ,
                headers: {'Content-Type': 'application/json'}
            });
            
            $scope.newCategory='';

            setTimeout(function(){$scope.getCategories($scope.listID);}, 500);
            
        }
    }
    



    $scope.deleteItem =function(id){
        $http({
            method: 'POST',
            url: '/deleteItem',
            data: {
                itemID:id
            } ,
            headers: {'Content-Type': 'application/json'}
        });

        $scope.getItems($scope.listID);
        $scope.editItemOn=[];
       // $scope.showNotes=[]; delete
    }


    $scope.deleteCategory =function(cat_id){
        $http({
            method: 'POST',
            url: '/deleteCategory',
            data: {
                categoryID: cat_id
            } ,
            headers: {'Content-Type': 'application/json'}
        });

        $scope.getCategories($scope.listID);
       
    }

    $scope.deleteList =function(list_id){
        $http({
            method: 'POST',
            url: '/deleteList',
            data: {
                listID: list_id
            } ,
            headers: {'Content-Type': 'application/json'}
        });

        $scope.getLists($scope.user);
        $scope.listID='';
        $scope.listName='No List Chosen';
       
    }

    $scope.saveEdit = function(id,notes,name,important) {
        
         $http({
            method: 'POST',
            url: '/editItem',
            data: {
                    itemID: id,
                    itemNotes : notes,
                    itemName : name,
                    important : important
            
            } ,
            headers: {'Content-Type': 'application/json'}
        });
        
       


    }


    $scope.bought = function (id,status){

        var newstatus = 1-status;
        $http({
            method: 'POST',
            url: '/bought',
            data: {
                    itemID: id,
                    bought: newstatus
            
            } ,
            headers: {'Content-Type': 'application/json'}
            
        });
        $scope.getItems($scope.listID);

    }

   

    $scope.nofind = function (id,status){

        var newstatus = 1-status;
        $http({
            method: 'POST',
            url: '/nofind',
            data: {
                    itemID: id,
                    nofind: newstatus
            
            } ,
            headers: {'Content-Type': 'application/json'}
            
        });
        $scope.getItems($scope.listID);

    }



   
});


   

