import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

const authUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body
  const user = await User.findOne({email})
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      courses: user.courses,
      learning: user.learning,
      wishlist: user.wishlist,
      cart: user.cart,
      isEducator: user.isEducator,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })
  } else {
    res.status(401)
    if (!user) {
      throw new Error('Invalid email')
    } else {
      throw new Error('Invalid password')
    }
  }
})

const registerUser = asyncHandler(async (req, res) => {
  const {name, email, password} = req.body
  const userExist = await User.findOne({email})
  if (userExist) {
    res.status(400)
    throw new Error('User already exists')
  }
  const user = await User.create({
    name,
    email,
    password
  })
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      courses: user.courses,
      learning: user.learning,
      wishlist: user.wishlist,
      cart: user.cart,
      isEducator: user.isEducator,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      courses: user.courses,
      learning: user.learning,
      wishlist: user.wishlist,
      cart: user.cart,
      isEducator: user.isEducator,
      isAdmin: user.isAdmin
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      courses: updatedUser.courses,
      learning: updatedUser.learning,
      wishlist: updatedUser.wishlist,
      cart: updatedUser.cart,
      isEducator: updatedUser.isEducator,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id)
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const getUsers = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12
  const page = Number(req.query.pageNumber) || 1

  const count = await User.countDocuments({})
  const users = await User.find({}).limit(pageSize).skip(pageSize * (page - 1))

  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize)
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.json({
      message: 'User removed'
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const updateUserToEducator = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    user.isEducator = req.body.isEducator
    const updatedUser = user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      courses: updatedUser.courses,
      learning: updatedUser.learning,
      wishlist: updatedUser.wishlist,
      cart: updatedUser.cart,
      isEducator: updatedUser.isEducator,
      isAdmin: updatedUser.isAdmin
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    user.isAdmin = req.body.isAdmin
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      courses: updatedUser.courses,
      learning: updatedUser.learning,
      wishlist: updatedUser.wishlist,
      cart: updatedUser.cart,
      isEducator: updatedUser.isEducator,
      isAdmin: updatedUser.isAdmin
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUserToEducator,
  updateUser
}