const User = require('../models/userModel')
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validateMongoDbId')
const { generateToken } = require('../config/jwtToken');
const {generateRefreshToken} = require('../config/refreshToken')
const jwt = require('jsonwebtoken')

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
    console.log(req.body)
    // check if user exists or not
    const findUser = await User.findOne({email});
    console.log(email)
    console.log(`This is the user ${findUser}`)
    const refreshToken = await generateRefreshToken(findUser?._id)
    console.log(`This is the refresh token: ${refreshToken}`);
    const updateUser = await User.findByIdAndUpdate(
        findUser._id,
        {
            refreshToken: refreshToken,
        },
        { new: true }
    );  
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
    })
    if(findUser && (await findUser.isPasswordMatched(password))){
        res.json({
            _id: findUser?._id,
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

// handle refresh token
const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    console.log(cookie)
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken)
    const user = await User.findOne({ refreshToken })
    if(!user) throw new Error('No refresh token present in db or not matched')
    // if we find the refresh token in db and cookies, then we need to verify it
    jwt.verify(
        refreshToken,
        process.env.JWT_SECRET,
        (err, decoded) => {
            if (err ||user.id !== decoded.id){
                throw new Error('There is somthing wrong with refresh token');
            }
            const accessToken = generateToken(user?.id);
            res.json({ accessToken });
        }
    )
    
})

// logout functionality
const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh Token in cookies");
    // assigning the refresh token to a variable so it can be used to find the user
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204);  //204 is forbidden
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204);

})

// update a user
const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(id)
    try{
        const updatedUser = await User.findByIdAndUpdate( _id, {
            firstname: req.body?.firstname,
            lastname: req.body?.lastname,
            email: req.body?.email,
            mobile: req.body?.mobile
        },{
            new: true,
        }
        );
        res.json(updatedUser);
    } catch (error){
        throw new Error(error)
    }
})


// Get all users
const getallUser = asyncHandler(async (req, res) => {
    try{
        const getUsers = await User.find();
        res.json(getUsers)
    } catch (error) {
        throw new Error (error)
    }
})

// Get a user
const getauser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    // console.log(req.params.id)
    try {
        const getaUser = await User.findById(id)
        res.json({
            getaUser
        })
    }catch(error){
        throw new Error(error)
    }
})

// Delete a user
const deleteauser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    // console.log(req.params.id)
    try {
        const deleteaUser = await User.findByIdAndDelete(id)
        res.json({
            deleteaUser
        })
    }catch(error){
        throw new Error(error)
    }
})

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)

    try {
        const block = User.findByIdAndUpdate( id, {
            isBlocked: true,
        },
        {
            new: true
        });
        res.json({
            message: "User Blocked"
        })
    } catch (error) {
        throw new Error(error)
    }
})
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const unblock = User.findByIdAndUpdate( id, {
            isBlocked: false,
        },
        {
            new: true,
        })
        res.json({
            message: "User unblocked"
        })
    } catch(error){
        throw new Error(error)
    }
})
module.exports = { 
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getauser, 
    deleteauser, 
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout
 }