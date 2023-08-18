const User = require('../models/userModel')
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/wtToken');

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({email:email});
    if(!findUser){
        // create new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User already exists")
    }
}
)

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({email});
    if(findUser && (await findUser.isPasswordMatched(password))){
        res.json({
            id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token : generateToken(findUser?._id)
        })
    } else {
        throw new Error('Invalid credentials')
    }
})
module.exports = { createUser, loginUserCtrl }