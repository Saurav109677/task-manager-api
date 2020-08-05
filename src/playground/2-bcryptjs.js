const myFunction= async ()=>{
    const password="HareKrsna"
    const hashedPassword=await bcrypt.hash(password, 8)

    console.log(hashedPassword);        // bcrypt passwords are irreversible .. login password can be hashed and compare

    const isMatch= await bcrypt.compare('HareKrsna',hashedPassword)
    console.log(isMatch);

}

myFunction()