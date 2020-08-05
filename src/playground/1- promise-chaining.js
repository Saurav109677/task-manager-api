//we r going to find & update a document by id and then count the no. of document having age 1
// using promise chainig

require('../db/mongoose')
const User=require('../models/User')

// User.findByIdAndUpdate('5f1ffe8192eed11448a852d3',{age:1}).then((user)=>{
//     console.log(user);
//     return User.countDocuments({age:1})
// }).then((c)=>{
//     console.log(c);
// }).catch((e)=>{
//     console.log(e);
// })

//converting to async- await
// mongoose always return promise
//Also mongoose is always async

const updateAndCount= async (id,age)=>{
    const foundUser= await User.findByIdAndUpdate(id,{age})
    const countDocuments= await User.countDocuments({age})
    return {
        count:countDocuments,
        user:foundUser
    }
}

updateAndCount('5f1ffe8192eed11448a852d3',1).then((result)=>{
    console.log(result);
}).catch((e)=>{
    console.log(e);
})
   