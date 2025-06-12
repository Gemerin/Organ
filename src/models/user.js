import mongoose from 'mongoose'
import { BASE_SCHEMA } from './basmodel.js'

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: '/images/default.png'
  }
},
BASE_SCHEMA.obj
)

export const User = mongoose.model('User', UserSchema)
