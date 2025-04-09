import type { Result } from "~~/types/result";
export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(
    `Delete API: ${body.type} label for ${body.FirstName} ${body.LastName} at ${body.School}: ${body.notes}`
  );

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY;

  // Update a result
  try {
    const acceptIds: Record<number, string> = {
      7326: "cef9335f-e06b-41c8-bffb-975987481145",
      2882: "37f66bbe-5835-461b-956c-fba3c3475618",
      689: "32b7f516-82a3-4383-9df8-b8c5544d1feb",
      3638: "2ee062a6-f3c3-4f05-bb9d-573cd593474c",
      1084: "b88d8e63-9bc3-4eaf-9bd1-9ef43cc49c4d",
      3639: "dbe83e8d-b4af-456a-ae3b-80f4e86e364a",
      1552: "b1c5e26e-3ac1-416c-9888-751ef472fdcc",
    };
    // Waitlist - School Label UUIDs
    const waitIds: Record<number, string> = {
      689: "6a6463d9-c688-47e5-b28b-f4c46b93d663", // Waitlist - Chrysler
      1084: "c455c96c-668a-47df-b757-ea211fecd604", // Waitlist - Edison
      1552: "39eedd2a-5bb9-4bed-a7ca-66e83a38259a", // Waitlist - Palmer
      2882: "dbe63e7a-1d79-4f84-a002-ff0e3e3f2b7e", // Waitlist - Bates
      3638: "9210baf6-5d7b-4b8f-83c5-f26e04ef22d7", // Waitlist - TSM
      3639: "676c58a4-f879-4ab5-8589-b0dda2be8f2b", // Waitlist - Edmonson
      7326: "afd1a207-6448-4c0e-8d00-e69e007b9ce1", // Waitlist - FLICS
    };
    const setLabelId = (
      body: Result,
      acceptIds: Record<number, string>,
      waitIds: Record<number, string>
    ) => {
      // Assign a labelId based on the school
      if (body.type === "Accept") {
        return acceptIds[body.SchoolID];
      } else if (body.type === "Waitlist") {
        return waitIds[body.SchoolID];
      } else if (body.type === "Update") {
        return "f03b84d4-f15e-4beb-aab7-32a6684a45ed"; // Updated Placement
      } else {
        return "";
      }
    };
    const labelId = setLabelId(body, acceptIds, waitIds);

    // ${result.submissionId}
    const response = await $fetch(
      `https://submittable-api.submittable.com/v4/submissions/${body.submissionId}/labels/${labelId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${SUBMITTABLE_API_KEY}`,
        },
      }
    );
    return { message: "New accept label properly removed" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
