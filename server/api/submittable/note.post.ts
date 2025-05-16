import type { Result } from "~~/types/result";
export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(`Note API: ${body.note} label for ${body.submissionId}`);

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY;

  // Update a result
  try {
    const response = await $fetch(
      `https://submittable-api.submittable.com/v4/submissions/${body.submissionId}/notes`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${SUBMITTABLE_API_KEY}`,
        },
      }
    );
    return { message: "New note logged in Submittable" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
