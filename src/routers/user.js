const express=require('express')
const User=require('../models/User')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail ,sendCancelEmail} = require('../emails/account')


const router=new express.Router()

router.post('/users', async (req,res)=>{
    //console.log(req.body);
    //res.send('testing!')
    const newUser=new User(req.body)
    

    // newUser.save().then(()=>{
    //     res.send(newUser)
    // }).catch((e)=>{
    //     res.status(400).send(e)
        
    // })

    //using async-await
    try{
        
        await newUser.save()
        sendWelcomeEmail(newUser.email , newUser.name)
        const token= await newUser.generateAuthToken();
        res.status(201).send({newUser , token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

//login
router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token })
    } catch(e){
        res.status(400).send(e)
    }
})

//upload profile pic
const upload= multer({
    //dest:'images',        becoz we dont want to store image in system , we want buffer of image saved in db
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return callback(new Error('Must be jpg/jpeg/png'))

        callback(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
   
     //req.authUser.avatar = req.file.buffer

     //setting the dimension and type of the profile pic using SHARP npm module
    const modifiedBuffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer()
    req.authUser.avatar = modifiedBuffer
   await req.authUser.save()

    res.send()
} , (error , req, res, next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth , async (req,res)=>{
    req.authUser.avatar=undefined

    await req.authUser.save()
    res.status(200).send()
})

router.get('/users/:id/avatar', async (req,res)=>{

    try{
        const user= await User.findById(req.params.id)
        if(!user || !user.avatar)
            throw new Error()

        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

//logout
router.post('/users/logout',auth, async (req,res)=>{
    try{

        req.authUser.tokens = req.authUser.tokens.filter((eachToken)=>{
            return eachToken.token != req.token
        })

        await req.authUser.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

//logout from all devices
router.post('/users/logoutAll',auth,async (req,res)=>{
    try{

        req.authUser.tokens=[]
        await req.authUser.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

// show my profile
router.get('/users/me',auth,async (req,res)=>{   
    // User.find({}).then((users)=>{           //empty to fetch all the data
    //     res.send(users)
    // }).catch((e)=>{
    //     res.send(e).status(500)                 //500 - server error
    // })   
    
        res.send(req.authUser)


})

router.get('/user/:id',async (req,res)=>{
    const _id=req.params.id
    // User.find({_id:new ObjectID(id)}).then((u)=> OR           mongoose automaically converts id to ObjectID
    //    User.findById(_id).then((u)=>{
    //        if(!u)
    //          return res.status(400).send()
    //     res.send(u)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })

    //async- await

    try{
        const user=await User.findById({_id})
        if(!user){
            return res.status(400).send("User not found!!")
        }

        res.send(user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.patch('/user/me', auth ,async (req,res)=>{
    const _id=req.params.id

    const updates=Object.keys(req.body)             // what we get from req.body as an array
    const allowedUpdates = ['name' , 'email' , 'password' , 'age']
    const isValidOperation = updates.every((elementOfUpdates)=> allowedUpdates.includes(elementOfUpdates))

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }

    try{

        // findOneAndUpdate() or findByIdAndUpdate() bypass mongoose
        // so the password cannot be hashed becoz it is using mongoose schema function 
        // which is ignored by these functions
        // so we have to make it in simple code. TRADITIONAL WAY
        
        //const user=await User.findOneAndUpdate({_id},req.body,{new:true, runValidators:true})
        
        
        //Assigning the new updated client value
        updates.forEach((element)=> req.authUser[element]=req.body[element])

        await req.authUser.save()
            res.send(req.authUser)
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

router.delete('/user/me', auth ,async (req,res)=>{
    try{
    //    const user= await User.findByIdAndDelete(req.user._id)
    //  if(!user){
    //     return res.status(404).send() 
    //     }
        await req.authUser.remove()
        sendCancelEmail(req.authUser.email, req.authUser.name)
        res.send(req.authUser)
    }
    catch(e){   
        res.status(500).send(e)
    }

})



module.exports= router
