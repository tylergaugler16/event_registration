const express = require('express');
const app = express();
const routes = require('./app/routes/routes.js');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './app/views');
app.use(express.static('public'));
app.use('/',routes);


// User.findOneAndUpdate({email: 'tylergaugler16@gmail.com'},{firstname: 'Tyler'}, function(err, user){
//   if(err) throw err;
//   console.log(user);
// });




app.listen(3000, function(){
  console.log("listening on port 3000");
});
