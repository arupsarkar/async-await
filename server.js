var express = require('express');
var app = express();
var bodyParser= require('body-parser');
var port = process.env.PORT || 8080;

// Serve static files
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
app.listen(port);
