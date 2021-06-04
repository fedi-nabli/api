import asyncHandler from 'express-async-handler'
import Course from '../models/courseModel.js'
import User from '../models/userModel.js'
import fs from 'fs-extra'

const getCourses = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {}

  const count = await Course.countDocuments({...keyword})
  const courses = await Course.find({...keyword}).limit(pageSize).skip(pageSize * (page - 1))

  res.json({
    courses,
    page,
    pages: Math.ceil(count / pageSize)
  })
})

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (course) {
    res.json(course)
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (course) {
    await course.remove()
    res.json({
      message: 'Course removed'
    })
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

const deleteDirectory = asyncHandler(async (req, res) => {
  const dir = req.params.dir
  const course = await Course.findById(req.params.id)

  if (course) {
    async () => {
      try {
        fs.remove(dir)
        res.json({
          message: 'Directory removed'
        })
      } catch (error) {
        res.status(404)
        throw new Error('Directory not found')
      }
    }
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

const createDirectory = async (directory) => {
  try {
    await fs.ensureDir(directory)
  } catch (error) {
    console.error(error)
  }
}

const createCourse = asyncHandler(async (req, res) => {
  const {
    name,
    image,
    category,
    subCategory,
    description,
    price
  } = req.body
  const dir = `/uploads/${name}`
  const directory = createDirectory(dir)
  const course = new Course({
    user: req.user._id,
    name: name,
    image: image,
    directory: directory,
    category: category,
    subCategory: subCategory,
    description: description,
    numReviews: 0,
    price: price
  })
  const createdCourse = await course.save()
  res.status(201).json(createdCourse)
})

const createSubDirectory = asyncHandler(async (req, res) => {
  const {
    title,
    videos
  } = req.body
  const course = await Course.findById(req.params.id)
  const parentDir = req.params.dir
  const dir = createDirectory(`/uploads/${parentDir}/${title}`)
  const subDirectory = {
    user: req.user._id,
    title: title,
    path: dir,
    videos: videos
  }
  const createdSubDir = course.subDirectories.push(subDirectory)
  await course.save()
  res.status(201).json({
    message: 'Sub Directory created Successfully!',
    createdSubDir
  })
})

const updateCourse = asyncHandler(async (req, res) => {
  const {
    name,
    image,
    category,
    subCategory,
    description,
    price
  } = req.body
  const course = await Course.findById(req.params.id)
  if (course) {
    course.name = name
    course.price = price
    course.description = description
    course.image = image
    course.category = category
    course.subCategory = subCategory
    const updatedCourse = await course.save()
    res.status(201).json(updatedCourse)
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

const updateSubdirectory = asyncHandler(async (req, res) => {
  const {
    title,
    videos
  } = req.body
  const course = await Course.findById(req.params.id)
  const parentDir = req.params.dir
  const dir = createDirectory(`/uploads/${parentDir}/${title}`)
  const subDirectory = {
    user: req.user._id,
    title: title,
    path: dir,
    videos: videos
  }
  const createdSubDir = course.subDirectories.push(subDirectory)
  await course.save()
  res.status(201).json({
    message: 'Sub Directory created Successfully!',
    createdSubDir
  })
})

const createCourseReview = asyncHandler(async(req, res) => {
  const {rating, comment} = req.body

  const course = await Course.findById(req.params.id)
  if (course) {
    const alreadyReviewed = course.reviews.find(r => r.user.toString() === req.user._id.toString())
    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Course already reviewed')
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    }
    course.reviews.push(review)
    course.numReviews = course.reviews.length
    course.rating = course.reviews.reduce((acc, item) => item.rating + acc, 0) / course.reviews.length
    await course.save()
    res.status(201).json({
      message: 'Review added'
    })
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

const getTopCourses = asyncHandler(async(req, res) => {
  const limit = Number(req.params.numLimit) || 10

  const courses = await Course.find({}).sort({ reting: -1 }).limit(limit)
  res.json(courses)
})

const addCourseToCart = asyncHandler(async (req, res) => {
  const {
    course,
    totalPrice
  } = req.body

  const user = await User.findById(req.params.userId)
  const newCart = {
    user: req.user._id,
    courses: courses.push(course),
    totalPrice: totalPrice
  }
  user.cart = newCart
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
})

const addCourseToWhishList = asyncHandler(async (req, res) => {
  const course = req.body

  const user = await User.findById(req.params.userId)

  user.whishlist.push(course)
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
})

const addCourseToLearning = asyncHandler(async (req, res) => {
  const course = req.body

  const user = await User.findById(req.params.userId)

  user.learning.push(course)
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
})

const addCourseToCourses = asyncHandler(async (req, res) => {
  const course = req.body

  const user = await User.findById(req.params.userId)

  user.courses.push(course)
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
})

export {
  getCourses,
  getCourseById,
  deleteCourse,
  deleteDirectory,
  createCourse,
  createSubDirectory,
  updateCourse,
  updateSubdirectory,
  createCourseReview,
  getTopCourses,
  addCourseToCart,
  addCourseToWhishList,
  addCourseToLearning,
  addCourseToCourses
}