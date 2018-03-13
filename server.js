var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

// Serve static files
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.send('Hello World!')
})


const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };


app.get('/users/:id', asyncMiddleware(async (req, res, next) => {
    /*
      if there is an error thrown in getUserFromDb, asyncMiddleware
      will pass it to next() and express will handle the error;
    */
    const user = await getUserFromDb({ id: req.params.id })
    res.json(user);
}));



var getUserFromDb = function(userId){
  if(userId == 1){
    return "John Smith"
  }else if(userId == 2){
    return "Jane Smith"
  }else if(userId == 3){
    return "Mark Cecillio"
  }else{
    return "Julio Tally"
  }

}

// Serve your app
console.log('Served: http://localhost:' + port);
app.listen(port);
