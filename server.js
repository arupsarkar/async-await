var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

var bodyParser= require('body-parser');
var port = process.env.PORT || 8080;
var jsforce = require('jsforce');
var cors = require('cors');
var socketio = require('socket.io');
var io = socketio.listen(server);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }

};

io.on('connection', function(socket){
  console.log('a client connected');
});

// cors({credentials: true, origin: true});
// Serve static files
// app.use(cors());
// app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var students = {};

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

app.get('/', asyncMiddleware(async (req, res, next) => {
  res.send('Hello World!')
}));

//
// OAuth2 client information can be shared with multiple connections.
//
var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : 'https://login.salesforce.com',
  clientId : '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U',
  clientSecret : '4992527745018937403',
  redirectUri : 'https://async-await.herokuapp.com/oauth2/callback'
});

var data = [
    {access_token:'sfdc_token', instance_url:'https://login.salesforce.com'}
    ];

//salesforce OAuth2.0 connection
app.get('/callback', asyncMiddleware(async (req, res, next) => {
  console.log(' salesforce response callback :', res.data);
  console.log(' salesforce response callback :', res.query);
  console.log(' salesforce response callback :', res.params);

  io.sockets.on('connection', function(socket){
    socket.emit('change', data);
    socket.on('change', function(obj){
      console.log(obj);
      data = obj;
      socket.broadcast.emit('change', data);
    });
  });


  res.send('success');
  // var conn = new jsforce.Connection({ oauth2 : oauth2 });
  // var code = req.param('code');
  // conn.authorize(code, function(err, userInfo){
  //   console.log(conn.accessToken);
  //   console.log(conn.refreshToken);
  //   console.log(conn.instanceUrl);
  //   console.log("User ID: " + userInfo.id);
  //   console.log("Org ID: " + userInfo.organizationId);
  //   res.send('success');
  // });
}));


app.get('/users/:id', asyncMiddleware(async (req, res, next) => {
    /*
      if there is an error thrown in getUserFromDb, asyncMiddleware
      will pass it to next() and express will handle the error;
    */
    //console.log("INFO : ", JSON.stringify(req))
    const user = await getUserFromDb({ id: req.params.id });
    res.json(user);
}));


app.get('/api/students', asyncMiddleware(async (req, res, next) => {
  const studentData = await getStudents();
  res.json(studentData);
}));

app.get('/api/students/id', asyncMiddleware(async (req, res, next) => {
  const studentData = await getStudent(req.query.studentId);
  res.json(studentData);
}));

app.post('/api/students/create', asyncMiddleware(async (req, res, next) => {
  if(!req.body.id) {
    console.error('request body not found');
    return res.sendStatus(400);
  }
  const studentData = await saveStudent(req.body.id, req.body.name, req.body.city);
  res.json(studentData);
}));


app.delete('/api/students/delete', asyncMiddleware(async (req, res, next) => {
  const studentData = await deleteStudent(req.query.studentId);
  res.json(studentData);
}));


var getStudent = function(studentId){
  var counter = 0;
  for(student in students){
    if(students[counter].id){
      if(studentId == students[counter].id){
        return students[counter];
      }
    }
    counter++;
  }
}

var deleteStudent = function(studentId){
  var newStudentList = [];
  var counter = 0;
  var studentCounter = 0;
  for(x in students){
    if(students[counter].id){
      if(studentId == students[counter].id){
        delete students[counter];
      }else{
        studentCounter++;
        newStudentList.push({id: studentCounter, name: students[counter].name, city: students[counter].city});
      }
    }
    counter++;
  }
  students.length = 0;
  students.push.apply(students, newStudentList);
  return newStudentList;
}

app.get('/api/sicom/store', asyncMiddleware(async (req, res, next) => {
  const storeData = await getStoreCode(req.query.storeId);
  res.json(storeData);
}));
var getStoreCode = function(storeId){
  return Math.floor(100000000 + Math.random() * 900000000);
}

var saveStudent = function(studentId, studentName, studentCity){
  students.push({id: studentId, name: studentName, city: studentCity});
  return students;
}

var getStudents = function(){
    students = [
      {id: '1', name: 'Mark Waugh', city:'New York'},
      {id: '2', name: 'Steve Jonathan', city:'London'},
      {id: '3', name: 'John Marcus', city:'Paris'}
    ];
    return students;
}

var getUserFromDb = function(userId){
  console.log(userId)
  if(userId.id == '1'){
    return "John Smith"
  }else if(userId.id == '2'){
    return "Jane Smith"
  }else if(userId.id == '3'){
    return "Mark Cecillio"
  }else{
    return "Julio Tally"
  }

}

// Serve your app
console.log('Served: http://localhost:' + port);
// The server should start listening
server.listen(port);
