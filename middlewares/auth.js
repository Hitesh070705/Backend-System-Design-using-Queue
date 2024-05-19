const {getUserfromtoken}=require("../service/set&getToken")

function checkAuthentication(req,res,next){
      const token=req.cookies?.token
      if(!token){
        return next()
      }
      try{
      const userPayload=getUserfromtoken(token)
      req.user=userPayload
      }catch(err){}
      return next()
}

module.exports={checkAuthentication}