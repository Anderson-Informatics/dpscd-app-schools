import User from '../../models/user.model'

interface SyncUserBody {
  email: string
  name?: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<SyncUserBody>(event)
    const normalizedEmail = body.email?.toLowerCase().trim()

    if (!normalizedEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      // Create new user with unassigned role
      user = new User({
        _id: crypto.randomUUID(),
        email: normalizedEmail,
        name: body.name || normalizedEmail,
        role: 'unassigned'
      })
      await user.save()
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
