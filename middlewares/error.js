class ErrorHandler extends Error{
    constructor(message,statuscode){
        super(message)
        this.statuscode=statuscode
    }
}

function errorMiddleware(err,req,res,next){
    err.message=err.message || "Internal Server Error"
    err.statuscode=err.statuscode || 500

    if(err.name=="CaseError"){
        const message=`Resource not found.Ivalid ${err.path}`
        err=new ErrorHandler(message,400)
    }
    if(err.code==11000){   //Database error
        const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
        err=new ErrorHandler(message,400)
    }
    if(err.name=="JsonWebTokenError"){
        const message="Json Web Token is inavlid. Try again"
        err=new ErrorHandler(message,400)
    }
    if(err.name=="TokenExpiredError"){
        const message=`Json Web Token is expired. Try again`
        err=new ErrorHandler(message,400)
    }
    return res.status(err.statuscode).json({
        success:false,
        message:err.message
    })
}

module.exports={
    ErrorHandler,
    errorMiddleware
}