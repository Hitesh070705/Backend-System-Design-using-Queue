const User=require("../models/UserSchema")
const {generateToken}=require("../service/set&getToken")

async function handleSignup(req,res){
    const {name,email,phone,password,role}=req.body
    const user= await User.create({
        name,
        email,
        phone,
        role,
        password
    })
    const token=generateToken(user)
    res.cookie("token",token).status(200).json({
        success:true,
        message:"User Registered successfully",
        user
    })
}

async function handleLogin(req,res){
    const {email,password,role}=req.body
    const user=await User.findOne({email})
    if(!user){
        return new ErrorHandler("Invalid username or password",400)
    }
   const isPasswordMatched=await user.comparePassword(password)
   if(!isPasswordMatched){
    return new ErrorHandler("Invalid username or password",400)
   }
   
   const token=generateToken(user)
   res.cookie("token",token).status(200).json({
    success:true,
    message:"User Logged in successfully",
    user
})
   
}

module.exports={
    handleSignup,handleLogin
}