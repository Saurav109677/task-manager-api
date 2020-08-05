const express = require('express')
require('./db/mongoose')
const User=require('./models/User')
const Task= require('./models/Task')
//const { ObjectID } = require('mongodb')
const userRouterAPI=require('./routers/user')
const taskRouterAPI=require('./routers/task')
const bcrypt=require('bcryptjs')

const app= express()
const port = process.env.PORT 

//Middleware demo   
// app.use((req,res,next) =>{
//     // block the get request and allow all other
//     // if(req.method === 'GET'){
//     //     res.send({
//     //         error:'GET request not allowed'
//     //     })
//     // }
//     // else{
//     //     next()
//     // }

//     // in maintanence 
//     return res.status(503).send({
//         error:'in maintanence!!'
//     })
// })

//----------------------------------------------------------------------------------------------
    //Upload file using multer

    const multer = require('multer')
    const upload = multer({
        dest:'images',
        limits:{
            fileSize: 1000000
       },
       fileFilter(req, file , callback){            //predefined function and call when multer runs
            //if(!file.originalname.endsWith('.pdf')){ 

             if(!file.originalname.match(/\.(doc|docx)$/)){
                return callback(new Error('Please upload the Word Document'))
            }

            callback(undefined , true)      // error:undefined and file is ok:true
       }
    })

    app.post('/upload',upload.single('urlVar'),(req,res)=>{
        res.send()
    } ,(error , req, res, next)=>{        //sending the error in json form using callback by middleware upload.single
         res.status(400).send({error: error.message})
    })
//----------------------------------------------------------------------------------------------


app.use(express.json())
app.use(userRouterAPI)
app.use(taskRouterAPI)



app.listen(port,()=>{
    console.log('Server is up on port:'+ port);
})


//   Without Middleware -- new Request --> run route handler
//   
//    with middleware -- new Request ---> do somethinng ---> run route handler


//----------------------------------------------------------------------------------------------
//  Using task ID get the whole owner information
// please see the model Task

    /*    const main =  async ()=>{
            const taskFound= await Task.findById('5f23fab5705ebd1144b520d3')
            await taskFound.populate('owner').execPopulate()
            console.log(taskFound.owner);
        }

        main()  */

//  Using user ID get all the tasks associated with him
// we are going to map the two document .. plese see the model User also

    const main = async ()=>{
        const foundUser = await User.findById('5f23fa34ea66ca0ed44dd9fb')
        await foundUser.populate('tasks').execPopulate()
        console.log(foundUser.tasks);
    }    

  //  main()

  

