const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next)=>{
   
    let jwtToken ;
    const authHeader = req.headers["token"];
    if(authHeader !== undefined){
        jwtToken = authHeader.split(" ")[1];
        console.log(jwtToken);
   }
   if(authHeader === undefined){
    return res.status(401).json({message:"JWT Token Not Found"})
   }else{
    //verify token 
    jwt.verify(jwtToken, "AJAY_SECRET_KEY", async(error, payload)=>{
        if(error){
            return res.status(401).json({message:"Invalid Token"})
        }
       else{
        req.userEmail = payload.email;
        next();
       }
        
    })

   }

};

module.exports = jwtAuth;