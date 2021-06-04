import express from 'express'
import {
  getCourses,
  getCourseById,
  deleteCourse,
  deleteDirectory,
  createCourse,
  updateCourse,
  createSubDirectory,
  updateSubdirectory,
  createCourseReview,
  getTopCourses,
  addCourseToCart,
  addCourseToWhishList,
  addCourseToLearning,
  addCourseToCourses
} from '../controllers/courseController.js'
import {protect, educator} from '../middleware/authMiddleware.js'
const router = express.Router()

router.route('/').get(getCourses).post(protect, educator, createCourse)
router.route('/:id/reviews').post(protect, createCourseReview)
router.get('/top', getTopCourses)
router.route('/:id').get(getCourseById).delete(protect, educator, deleteCourse).put(protect, educator, updateCourse)
router.route('/:id/:dir').delete(protect, educator, deleteDirectory).post(protect, educator, createSubDirectory).put(protect, educator, updateSubdirectory)
router.route('/:userId/cart').post(protect, addCourseToCart)
router.route('/:userId/whishlist').post(protect, addCourseToWhishList)
router.route('/:userId/learning').post(protect, addCourseToLearning)
router.route('/:userId/courses').post(protect, addCourseToCourses)

export default router