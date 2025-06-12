import mongoose from 'mongoose'
import { BASE_SCHEMA } from './basmodel.js'

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

TodoSchema.add(BASE_SCHEMA)

export const Todo = mongoose.model('Todo', TodoSchema)
