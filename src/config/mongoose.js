import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Connects to the MongoDB database using the connection string provided in the environment variables.
 *
 * @async
 * @function connectToDB
 * @throws {Error} Throws an error if the `DB_CONNECTION_STRING` is not defined in the environment variables.
 * @throws {Error} Throws an error if the connection to MongoDB fails.
 * @returns {Promise<void>} Resolves when the connection is successful.
 */
export const connectToDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING

  if (!connectionString) {
    throw new Error('DB_CONNECTION_STRING is not defined in environment variables')
  }

  try {
    await mongoose.connect(connectionString)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error', error)
    throw error
  }
}
