export default (function () {

    var self = {};
 
    self.solve = function (A,B) { //Solve Ax=B
     if(!checkInput(A,B))
         return false;
     var system = A.slice();
     for(var i = 0;i < B.length; i++)
         system[i].push(B[i]);
 
     for(var i = 0;i < system.length ;i++){
         var pivotRow = findPivotRow(system,i);
         if (typeof pivotRow == 'boolean')
            if(!pivotRow)
                return false; //Singular system
         if(pivotRow != i)
             system = swapRows(system,i,pivotRow)
         var pivot = system[i][i];
         for(var j = i; j < system[i].length;j++){  //divide row by pivot
             system[i][j] = system[i][j]/pivot;
         }
         for(var j = i + 1;j < system.length ; j++){ //Cancel bellow pivot
             if(system[j][i] != 0){
                 var operable = system[j][i];
                 for(var k = i; k < system[i].length; k++){
                     system[j][k] -= operable*system[i][k];
                 }
             }
         } //Matriz Echelon
     }
     for(var i = system.length -1; i > 0 ;i--){ //Back substitution
         for(var j = i - 1; j>= 0; j--){
             if(system[j][i] != 0){
                 var operable = system[j][i];
                 for(var k = j; k < system[j].length; k++){
                     system[j][k] -= operable*system[i][k];
                 }
             }
         }
     }
     var answer = [];
     for(var i = 0;i < system.length;i++){
         answer.push(system[i].pop())
     }
     return answer;   
    }
 
    function findPivotRow(sys, index){ //Pivotal consensation
        var row = index;
        for(var i = index ; i < sys.length; i++)
            if(Math.abs(sys[i][index]) > Math.abs(sys[row][index]))
                row = i;
        if(sys[row][index] == 0)
            return false;
        return row
    }
 
    function swapRows(sys, row1, row2){
     var cache = sys[row1];
     sys[row1] = sys[row2];
     sys[row2] = cache;
     return sys;
    }
 
 
    function checkInput(coeff, con){ //Coefficients and constants
        if(coeff.length != con.length)
            return false;
        for(var i = 0;i < coeff.length;i++){
            if(coeff[i].length != con.length)
                return false;
        }
        return true;
    }
 
    return self;
 
 })()