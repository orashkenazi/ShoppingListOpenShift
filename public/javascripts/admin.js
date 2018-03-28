var app = angular.module("ShoppingListAdmin", []);

app.controller("adminConsole", function($scope, $http, $timeout) {

$scope.username='initial username';
$scope.password='';
$scope.addUserError='initer';
$scope.format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;    //formant for validating text
$scope.cmdresponse = '';
$scope.cmdbox='';
$scope.pass='';

$scope.cmdsend = function(){
   
    $http({
        method: 'GET',
        url: '/cmd',
        params: {
            str : $scope.cmdbox
        } ,
        headers: {'Content-Type': 'application/json'}
    }).then(function(response){ 

        
        $scope.cmdresponse = response;
        
        
       
       
    });
    

}

$scope.addUser = function(){
  
    if (($scope.username==null || $scope.username=='') || ($scope.password==null || $scope.password==''))
         { 
            $scope.addUserError="*Please insert item username // passwpord";
            $timeout(function(){$scope.addUserError='';}, 3000);
            

            return;
        }

        if( $scope.format.test($scope.username) ||  $scope.format.test($scope.password))
        {   
            $scope.addUserError="*format error";
            $timeout(function(){$scope.addUserError='';}, 3000);
            

            return;
         }
          

    else{
        $http({
            method: 'GET',
            url: '/addUser',
            params: {
                username : $scope.username,
                password : $scope.password
            } ,
            headers: {'Content-Type': 'application/json'}
        }).then(function(response){ 

            if (response.data==1062)
            {
            $scope.addUserError = 'user already exist';
            
            $timeout(function(){$scope.addUserError='';}, 3000);}
            $scope.username=''; 
            $scope.password='';
           
           
        });

       
    }
    
}

});

