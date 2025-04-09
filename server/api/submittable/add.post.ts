import type { Result } from "~~/types/result";
export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(
    `Add API: ${body.type} label for ${body.FirstName} ${body.LastName} at ${body.School}: ${body.notes}`
  );

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY;

  // Update a result
  try {
    // These are the new UUID labelIds for the different Accept - School labels
    const acceptIds: Record<number, string> = {
      7326: "cef9335f-e06b-41c8-bffb-975987481145", // Accept - FLICS
      2882: "37f66bbe-5835-461b-956c-fba3c3475618", // Accept - Bates
      689: "32b7f516-82a3-4383-9df8-b8c5544d1feb", // Accept - Chrysler
      3638: "2ee062a6-f3c3-4f05-bb9d-573cd593474c", // Accpet - TSM
      1084: "b88d8e63-9bc3-4eaf-9bd1-9ef43cc49c4d", // Accept - Edison
      3639: "dbe83e8d-b4af-456a-ae3b-80f4e86e364a", // Accept - Edmonson
      1552: "b1c5e26e-3ac1-416c-9888-751ef472fdcc", // Accept - Palmer
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
    // These are the stage UUIDs that are unique to the Project and will need to be updated every year
    // UPDATE ANNUALLY
    const stagePK1: Record<number, string> = {
      689: "5a39d74d-4e89-482f-9e08-7c192f0f8a65", // Accept - Chrysler
      1084: "386a187c-4999-4285-b911-c47db1e57ca7", // Accept - Edison
      1552: "0755b60a-f309-4d82-8e73-9d01ba52e568", // Accept - Palmer
      2882: "0bd3a9b9-81b0-4c54-ac0a-322100ae11ed", // Accept - Bates
      3638: "798d05b1-b046-4ba1-bede-b4ecf833cc4d", // Accept - TSM
      3639: "f9922d33-0de3-4f9b-a282-0f60f30487bc", // Accept - Edmonson
      7326: "49e1071c-9655-426e-9eed-7823e1b06ce7", // Accept - FLICS
    };
    const stage28: Record<number, string> = {
      689: "8b747e87-baa4-43bd-baa2-e7955ab4094c", // Accept - Chrysler
      1084: "44aa4c5d-c256-4eab-98ce-6f45fce4d37e", // Accept - Edison
      1552: "b1d1a9f5-270c-4655-a987-2a9e65268683", // Accept - Palmer
      2882: "e9aa6041-b84b-4156-9ad5-e94bab3ef079", // Accept - Bates
      3638: "c3f02873-98dc-45c3-88e6-431d2d4cc27f", // Accept - TSM
      3639: "d5a66b4a-1d29-4ec5-b87c-78fd35cf81a1", // Accept - Edmonson
      7326: "ea372269-422a-4b0f-a280-4694c7bfc836", // Accept - FLICS
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

    const response = await $fetch(
      `https://submittable-api.submittable.com/v4/submissions/${body.submissionId}/labels/${labelId}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${SUBMITTABLE_API_KEY}`,
        },
      }
    );

    if (body.type == "Accept") {
      const setStageId = (
        body: Result,
        stagePK1: Record<number, string>,
        stage28: Record<number, string>
      ) => {
        // Assign the appropriate stageId based on the School and grade level
        if (["Pre-K", "Kindergarten", "1"].includes(body.Grade)) {
          return stagePK1[body.SchoolID];
        } else if (["2", "3", "4", "5", "6", "7", "8"].includes(body.Grade)) {
          return stage28[body.SchoolID];
        } else {
          return "";
        }
      };

      const stageId = setStageId(body, stagePK1, stage28);

      if (stageId !== "") {
        const responseStage = await $fetch(
          `https://submittable-api.submittable.com/v4/submissions/${body.submissionId}/stage/${stageId}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              Authorization: `Basic ${SUBMITTABLE_API_KEY}`,
            },
          }
        );
      }
    }

    return { message: "New accept label properly applied" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
