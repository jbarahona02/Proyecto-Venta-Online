'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_super_secreta_admin';

exports.createTokenUser = (user)=>{
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(15, 'minutes').unix()
    }

    return jwt.encode(payload,key);
}