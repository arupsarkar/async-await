var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

// Serve static files
app.use(express.static(__dirname + '/public'));

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
  console.log('Inside server /api/students');
  const studentData = await getStudents();
  console.log('Student data : ', JSON.stringify(studentData));
  res.json(studentData);
}));

app.post('/api/students/create/:studentData', asyncMiddleware(async (req, res, next) => {
  var rawData = req.params.studentData;
  var obj = JSON.parse(rawData);
  console.log('POST : create Students - Start');
  console.log('POST : create Students - req ', rawData);
  console.log('POST : create Students - studentData name ', obj.name);
  // students.push({id: obj.id, name: obj.name, city: obj.city});
  const studentData = await saveStudent(rawData);
  console.log(JSON.stringify(studentData))
  res.json(studentData);
  console.log('POST : create Students - End');
}));


app.delete('/api/students/delete/:studentId', function(req, res, next){
  var rawData = req.params.studentId;
  var obj = JSON.parse(rawData);
  console.log('DELETE : delete Students - req ', rawData);
  const studentData = deleteStudent(rawData);
  res.json(studentData);
});

var deleteStudent = function(studentId){
  var rawData = studentId;
  var obj = JSON.parse(rawData);
  console.log('deleteStudent ', obj.id);

  var counter = 0;
  for(x in students){
    if(students[counter].id){
      console.log(students[counter].id, students[counter].name);
      if(obj.id == students[counter].id){
        delete students[counter];
        return students;
      }
      counter++;
    }

  }
}


var saveStudent = function(studentData){
  var rawData = studentData;
  var obj = JSON.parse(rawData);
  students.push({id: obj.id, name: obj.name, city: obj.city});
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
