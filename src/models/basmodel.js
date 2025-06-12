import mongoose from 'mongoose'

// Create a schema.
const baseSchema = new mongoose.Schema({})

// Options to use converting the document to a plain object and JSON.
const convertOptions = {
  getters: true, // Include getters and virtual properties.
  versionKey: false, // Exclude the __v property.
  /**
   * Transforms the document, keeping the _id property intact.
   *
   * @param {object} doc - The mongoose document which is being converted.
   * @param {object} ret - The plain object representation which has been converted.
   * @returns {object} The transformed object.
   */
  transform: (doc, ret) => {
    ret.id = ret._id // Add a new `id` field for convenience
    return ret // Keep `_id` intact
  }
}

// Set options.
baseSchema.set('timestamps', true) // Add createdAt and updatedAt.
baseSchema.set('toObject', convertOptions)
baseSchema.set('toJSON', convertOptions)

export const BASE_SCHEMA = baseSchema // Removed Object.freeze for flexibility
