const express=require("express")
const {handleSignup,handleLogin}=require("../controllers/user")

const router=express.Router()

router.get("/signup",(req,res)=>{
    return res.render("signup")

})
router.post("/signup",handleSignup)

router.get("/login",(req,res)=>{
    return res.render("login")
})
router.post("/login",handleLogin)

router.get("/logout",(req,res)=>{
    res.clearCookie("token").status(201).json({
        success:true,
        message:"User logged out successfully!"
    })
})

module.exports=router