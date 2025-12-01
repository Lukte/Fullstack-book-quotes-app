
const jwt = require('jsonwebtoken');

const authenticateToken = (request, response, next) => {
    // get token from header
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer TOKEN"

   if(!token) {
    return response.status(401).json({message: 'Access token required'});
   }

    // verify token
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if(error){
            return response.status(403).json({message: 'Invalid or expired token'});
        }
        request.user = user; // add user info to request
        next(); // Continue to next middleware/route

    });

};

module.exports = authenticateToken;