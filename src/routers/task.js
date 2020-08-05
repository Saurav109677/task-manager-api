const express= require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')

const router=new express.Router();

router.post('/task',auth ,async (req,res)=>{

    const newTask= new Task({
        ...req.body,
        owner: req.authUser._id
    })

    try{
        await newTask.save(newTask)
        res.send(newTask)
    }   
    catch(e){
        res.send(e)
    }
})

//Filter
// get task a/c to completed    using query param
// or if not provided then show all the task related to that user

//GET /tasks?completer=true
//GET /tasks?limit=10&skip=10 means 2nd set of data from 11 to 20
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req,res)=>{
    const match={}
    const sort ={}

    if(req.query.completed){
        match.completed = req.query.completed ==='true'     /// query default return string
    }

    if(req.query.sortBy){
        const part=req.query.sortBy.split(':')
        sort[part[0]]= part[1] === 'desc'? -1 : 1
    }

    try{
        //const tasks =await Task.find({onwer:req.authUser._id})
        await req.authUser.populate(
            {
                path:'tasks',
                match,
                options:{
                    limit: parseInt(req.query.limit),       // how mnay data u want to show at a time
                    skip:parseInt(req.query.skip),           //how many u want to skip
                    sort
                        //createdAt: -1                     // 1- ascending and 2- descending
                        //completed: 1
                
                }
            }
        ).execPopulate()
          res.send(req.authUser.tasks)
        }
    catch(e){
        res.status(500).send(e)
    }
    
})

router.get('/task/:id',auth ,async (req,res)=>{
    try{
        //const task=await Task.findById(req.params.id)
        const task= await Task.findOne({_id:req.params.id, owner:req.authUser._id})

        if(!task)
            return res.status(400).send()

        res.send(task)
    }
    catch(e){
        res.status(400).send({error: 'not found'})
    }
})

router.patch('/task/:id', auth ,async (req,res)=>{
    const updatesFromBody=Object.keys(req.body)
    const allowedOptions=['description','completed']
    const isValidOperation = updatesFromBody.every((element)=> allowedOptions.includes(element))

    if(!isValidOperation){
        return res.send({error:'keys not allowed'})
    }

    try{
        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        // if we have to use middleware
        //breaking find and update

        const task= await Task.findOne({_id:req.params.id , owner:req.authUser._id})

        if(!task){
            return res.status(404).send()
        }  

        updatesFromBody.forEach((element)=>{
            task[element]=req.body[element]
        })

        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(500).send({error:'not found'})
    }
})

router.delete('/task/:id', auth,async (req,res)=>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id , owner : req.authUser._id})

        if(!task)
            res.status(404).send()

        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})

module.exports = router
