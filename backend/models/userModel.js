import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
})

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    }
  ],
  learning: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    }
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    }
  ],
  cart: cartSchema,
  isEducator: {
    type: Boolean,
    required: true,
    default: false
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(20)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User