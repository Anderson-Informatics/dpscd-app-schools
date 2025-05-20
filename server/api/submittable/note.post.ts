import type { Result } from "~~/types/result";
export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log("Body: ", body);

  // The submissionId based major change log
  const changeLog = body.log;
  console.log("Change log: ", changeLog);

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY;

  // Update a result
  try {
    for (const change of changeLog) {
      // Get the result from the database
      // Construct a custom message for submittable
      let customMessage = "";
      if (body.changes[0] === change.change) {
        // Don't duplicte the triggering action if it the the same
        customMessage = `${body.userName} from management app:<br/>Note: ${body.notes}<br/>Change: ${change.change}`;
      } else {
        // If the change is not the same, add the triggering action
        customMessage = `${body.userName} from management app:<br/>Trigger Action: ${change.change}<br/>Note: ${body.notes}<br/>Change: ${change.change}`;
      }
      const response = await $fetch(
        `https://submittable-api.submittable.com/v4/submissions/${change.submissionId}/notes`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${SUBMITTABLE_API_KEY}`,
          },
          body: {
            note: customMessage,
            noteVisibility: "team",
          },
        }
      );
      console.log("Submittable response: ", response);
    }
    return { message: "New notes logged in Submittable" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
