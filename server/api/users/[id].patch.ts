import User from '../../models/user.model'

const VALID_ROLES = ['central office admin', 'school admin', 'unassigned'] as const

type UserRole = (typeof VALID_ROLES)[number]

interface UpdateUserBody {
  role: UserRole
  schoolId?: number
  schoolName?: string
}

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody<UpdateUserBody>(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User id is required'
      })
    }

    if (!VALID_ROLES.includes(body.role)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid role'
      })
    }

    if (body.role === 'school admin' && typeof body.schoolId === 'number' && body.schoolName) {
      const updated = await User.updateOne(
        { _id: id },
        {
          $set: {
            role: body.role,
            schoolId: body.schoolId,
            schoolName: body.schoolName
          }
        }
      )

      if (!updated) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
      }

      return updated
    } else {
      const updated = await User.updateOne(
        { _id: id },
        {
          $set: { role: body.role }
        }
      )

      if (!updated) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
      }

      return updated
    }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'statusCode' in err) {
      throw err
    }

    const message = err instanceof Error ? err.message : String(err)
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }
})
