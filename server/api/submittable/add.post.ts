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
    const stagePK: Record<number, string> = {
      1084: "f6a0db0a-9b42-47c3-b71c-621de6fbede5", // Accept - Edison x
      1552: "9bf8e42a-9787-492d-8c72-281ee9480c63", // Accept - Palmer x
      3639: "275e4386-24ee-4261-92e2-9e5cb686426b", // Accept - Edmonson x
    };
    const stageK1: Record<number, string> = {
      689: "eabba42c-3b38-4e7f-ac5e-f288b1403a08", // Accept - Chrysler x
      1084: "d96dcb11-1aca-4d14-8f16-6a15bb68d3bb", // Accept - Edison x
      1552: "153bead0-8271-41ce-908d-b78ac6905a30", // Accept - Palmer x
      2882: "b9755ab9-8bd7-40c2-b4c3-96bf64582261", // Accept - Bates x
      3638: "d0b4e411-aced-4aa6-b82d-1c5bca685b8c", // Accept - TSM x
      3639: "26c00808-22c9-4568-befb-8417d8b1929a", // Accept - Edmonson x
      7326: "2ac5959f-e806-460f-922a-835c9b0726dc", // Accept - FLICS x
    };
    const stage28: Record<number, string> = {
      689: "00c5654e-0c02-4870-935e-65c6a912c304", // Accept - Chrysler x
      1084: "b76a8c46-4596-4a13-b21a-376f8cdc4779", // Accept - Edison x
      1552: "52658e77-7b6c-4a74-b828-918e9be337c1", // Accept - Palmer x
      2882: "aac80917-64f8-4e77-aefa-1bbd947b6f5d", // Accept - Bates x
      3638: "b5df003c-accc-48ce-8b26-b469714d2cfc", // Accept - TSM x
      3639: "8ef3e389-0a20-4b1a-bd09-4421fbe79cad", // Accept - Edmonson x
      7326: "c3f547cc-68c9-474d-8470-8bc0df2178f0", // Accept - FLICS x
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
        stagePK: Record<number, string>,
        stageK1: Record<number, string>,
        stage28: Record<number, string>
      ) => {
        // Assign the appropriate stageId based on the School and grade level
        if (["Pre-K"].includes(body.Grade)) {
          return stagePK[body.SchoolID];
        } else if (["Kindergarten", "1"].includes(body.Grade)) {
          return stageK1[body.SchoolID];
        } else if (["2", "3", "4", "5", "6", "7", "8"].includes(body.Grade)) {
          return stage28[body.SchoolID];
        } else {
          return "";
        }
      };

      const stageId = setStageId(body, stagePK, stageK1, stage28);

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
