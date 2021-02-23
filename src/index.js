const express = require('express')
require('./db/mongoose')
const Tasks = require('./models/tasks')
const Users = require('./models/user')
const userRoutes = require('./routes/user')
const taskRouts = require('./routes/task')

const cors = require('cors');
const app = express()
app.use(cors())
app.use(express.json())

app.use(userRoutes)

app.use(taskRouts)

const port = process.env.PORT;

const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100'
  ];
  
  // Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    }
  }

//   app.get('/', cors(corsOptions), (req, res, next) => {
//     res.json({ message: 'This route is CORS-enabled for an allowed origin.' });
//   })
  
        // Enable preflight requests for all routes
        //   app.options('*', cors(corsOptions));


// app.use((req,res,next) => {
//     res.status(503).send('Site is under maintainces');
// })

// convert the req object to json


app.listen(port, () => {
    console.log('server is on port' +port);
})

// relation ship betwwen task and user
// const main = async() => {
//     const task = await Tasks.findById('5e93173b687a8130d060fd4c')
//     // dipslapying owner info of task by adding ref in task model then populate //
//     await task.populate('owner').execPopulate()
//     console.log(task.owner);

//     const user = await Users.findById('5e9312a824b9213454cc056e')
//      // dipslapying task info of user by adding virtual in user model then populate //
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);
// }



