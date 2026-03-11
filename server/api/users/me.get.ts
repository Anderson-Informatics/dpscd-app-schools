import User from '../../models/user.model'

interface CurrentUserQuery {
  email: string
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery<CurrentUserQuery>(event)

    if (!query.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    const user = await User.findOne({ email: query.email })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return user
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }
})
