const jwt = require('jsonwebtoken')

const myFunction= async ()=>{
    const token = jwt.sign({_id:'abc123'},'secretcode',{expiresIn: '7 days'})
    console.log(token);

    const data= jwt.verify(token, 'secretcode')
    console.log(data);
}

myFunction()