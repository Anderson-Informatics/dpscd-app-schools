import User from '../../models/user.model'

export default defineEventHandler(async (_event) => {
  try {
    const users = await User.find()
    return users
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }
})
