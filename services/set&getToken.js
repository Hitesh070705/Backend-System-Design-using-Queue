const jwt=require("jsonwebtoken")
const secret="Hi@070705"

function generateToken(user){
    const payload={
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
    }
    const token=jwt.sign(payload,secret)
    return token
}

function getUserfromtoken(token){
    const payload=jwt.verify(token,secret)
    return payload
}


module.exports={
    generateToken,getUserfromtoken
}