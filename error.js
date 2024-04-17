const { logEvents } =require( "./server");

const errorhandler=(err,req,res,next)=>{
    logEvents(`${err.message}${err.name}`,'error.txt')
    console.log(err.stack)
    res.status(500).send(err.message)

}

module.exports=errorhandler