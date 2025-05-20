export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);

  // The submissionId based major change log
  const changeLog = body.log;

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY;

  // Update a result
  try {
    const uniqueSubmissionIds = new Set();
    // Extract unique submission IDs from the change log
    for (let i = 0; i < changeLog.length; i++) {
      uniqueSubmissionIds.add(changeLog[i].submissionId);
    }

    for (const id of uniqueSubmissionIds) {
      const changes = changeLog.filter(
        (change: { submissionId: string; change: string }) =>
          change.submissionId === id
      );
      console.log("Changes", changes.length);
      // Get the result from the database
      // Construct a custom message for submittable
      let customMessage = "";
      if (changes.length === 1) {
        if (body.changes[0] === changes[0].change) {
          // Don't duplicte the triggering action if it the the same
          customMessage = `${body.userName} from management app:<br/>Note: ${body.notes}<br/>Movement: ${changes[0].change}`;
        } else {
          // If the change is not the same, add the triggering action
          customMessage = `${body.userName} from management app:<br/>Trigger Action: ${changes[0].change}<br/>Note: ${body.notes}<br/>Movement: ${changes[0].change}`;
        }
      } else if (changes.length > 1) {
        let changeText = "";
        for (const each of changes) {
          changeText += `${each.change}<br/>`;
        }
        customMessage = `${body.userName} from management app:<br/>Note: ${body.notes}<br/>Movement: ${changeText}`;
      }

      await $fetch(
        `https://submittable-api.submittable.com/v4/submissions/${id}/notes`,
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
    }
    return { message: "New notes logged in Submittable" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
