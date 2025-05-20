import type { Result } from "~~/types/result";
import type { Change } from "~~/types/change";
import type { School } from "~~/types/school";

export default function () {
  const toast = useToast();
  const resultStore = useResultStore();
  const changeStore = useChangeStore();
  const settingsStore = useSettingsStore();
  const userStore = useAppUser();

  const showModal = ref<boolean>(false);
  const pendingChanges = ref<string[]>([]);
  const pendingStatus = ref<boolean>(false);
  const buttonText = ref<string>("Check");
  const buttonDisabled = ref<boolean>(false);
  const pendingIds = ref<string[]>([]);
  const pendingLog = ref<
    Array<{ submissionId: string; change: string } | null>
  >([]);
  const changeLogged = ref<boolean>(false);

  const addLabel = (payload: Result, type: string) => {
    settingsStore.settings.applyLabels
      ? resultStore.addLabel(payload, type)
      : null;
  };
  const deleteLabel = (payload: Result, type: string) => {
    settingsStore.settings.applyLabels
      ? resultStore.deleteLabel(payload, type)
      : null;
  };

  const addToWaitingList = (payload: Result) => {
    if (payload.lotteryList === "Forfeited") {
      // This will mark the pending status and continue to similate the changes
      if (payload.stage === "Check") {
        pendingStatus.value = true;
        buttonText.value = "Submit Changes";
        pendingChanges.value.push(
          `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Waiting List'`
        );
        pendingIds.value.push(payload._id);
        pendingLog.value.push({
          submissionId: payload.submissionId,
          change: `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Waiting List'`,
        });
      }
      // Once changes have been similated/pending, actually make the changes
      if (payload.stage === "Submit Changes") {
        const maxRank = getMaxRank(
          payload,
          resultStore.results,
          "Waiting List"
        );
        console.log(`Waiting list max rank: ${maxRank}`);
        // add the pending changes to the history log
        const changeObj: Change = {
          changes: pendingChanges.value,
          ids: pendingIds.value,
          userId: userStore.value?.user.localAccountId ?? "",
          userEmail: userStore.value?.user.username ?? "",
          userName: userStore.value?.user.name ?? "",
          notes: payload.notes ?? "",
          date: new Date(),
          log: pendingLog.value,
        };
        changeStore.addChange(changeObj);
        // Update the Pinia store for the result being changed to "Decline"
        const waitlistObj = resultStore.results.find(
          (item: Result) => item._id === payload._id
        );
        if (waitlistObj) {
          waitlistObj.lotteryList = "Waiting List";
          waitlistObj.adjustedRank = maxRank + 1;
          // Send the decline information to update
          resultStore.updateResult({
            ...waitlistObj,
            update: {
              lotteryList: "Waiting List",
              adjustedRank: maxRank + 1,
            },
          });
          toast.add({
            title: "Successfully added to waiting list",
            description: `Moved ${waitlistObj.FirstName} ${waitlistObj.LastName} to the Waiting List`,
          });
        } else {
          console.log("No matching result found");
        }
        toast.add({
          title: "Successfully added to waiting list",
          description: `Changed ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Waiting List'`,
        });
        setTimeout(() => {
          showModal.value = false;
          //selectedResult.value = {};
        }, 1000);
      }
    }
  };

  const adjustRankings = (payload: Result) => {
    console.log("Adjust Rankings function triggered");
    // filter to the same school, grade, and lotteryList and lower ranked results
    let filtered = resultStore.results.filter((item: Result) =>
      item.SchoolID === payload.SchoolID &&
      item.Grade === payload.Grade &&
      item.lotteryList === payload.lotteryList &&
      item.adjustedRank !== undefined &&
      payload.adjustedRank !== undefined
        ? item.adjustedRank !== null &&
          payload.adjustedRank !== null &&
          item.adjustedRank > payload.adjustedRank
        : false
    );
    // This will prevent the additional "change" of not moving any up the forfeited list
    if (payload.lotteryList === "Forfeited") {
      return;
    }
    // Create an Array of ids from the lower ranked results
    let ids: string[] = filtered.map((item: Result) => item._id);
    if (payload.stage === "Check") {
      // Add info to pending changes array to display as interim step
      pendingChanges.value.push(
        `Move ${ids.length} applicants up the ${payload.lotteryList}`
      );
    }
    if (payload.stage === "Submit Changes") {
      // Update the filtered Pinia Store
      filtered.forEach((item) => {
        item.adjustedRank = (item.adjustedRank ?? 0) - 1;
      });
      // Deal with shallowRef limitation of TanStack table
      resultStore.results = [...resultStore.results];
      // Send the ids to update the list rankings
      resultStore.adjustRankings(ids);
      //resultStore.adjustRankings(payload);
      toast.add({
        title: "Waitlist Successfully Adjusted",
        description: `Moved ${ids.length} applicants up the ${payload.lotteryList}`,
      });
    }
  };

  // This will check for available seats and run the makeOffer function if seats available
  const checkWaitlist = (payload: Result) => {
    console.log("Check Waitlist Function Triggered");
    // Get the capacity for the selected school
    const school = resultStore.schools.find(
      (item: School) => item.SchoolID === payload.SchoolID
    );

    if (!school || !school.Capacity[payload.Grade]) {
      console.error("School or capacity not found for the given grade.");
      return;
    }

    const capacity = school.Capacity[payload.Grade];

    if (capacity === undefined) {
      console.error("Capacity is undefined for the given grade.");
      return;
    }

    // Calculate the number of seats filled
    const filled = resultStore.results.filter(
      (item: Result) =>
        item.SchoolID === payload.SchoolID &&
        item.Grade === payload.Grade &&
        // Fix this to account for offer pending students
        (item.lotteryList === "Offered List" ||
          item.queueStatus === "Offer Pending")
    ).length;
    if (filled <= capacity) {
      makeOffer(payload);
    }
  };

  const confirmEnrollment = (payload: Result) => {
    // This will mark the pending status and continue to simulate the changes
    if (payload.stage === "Check") {
      pendingStatus.value = true;
      buttonText.value = "Submit Changes";
      pendingChanges.value.push(
        `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`
      );
      pendingIds.value.push(payload._id);
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`,
      });
    }
    if (payload.stage === "Submit Changes") {
      // Disable the button to prevent double clicking
      buttonDisabled.value = true;
      // add the pending changes to the history log
      const changeObj: Change = {
        changes: pendingChanges.value,
        ids: pendingIds.value,
        userId: userStore.value?.user.localAccountId ?? "",
        userEmail: userStore.value?.user.username ?? "",
        userName: userStore.value?.user.name ?? "",
        notes: payload.notes ?? "",
        date: new Date(),
        log: pendingLog.value,
      };
      changeStore.addChange(changeObj);
      // Update the Pinia store for the result being changed to "Decline"
      const updObj = resultStore.results.find(
        (item: Result) => item._id === payload._id
      );
      if (updObj) {
        // Update Pinia store for updated object
        updObj.confirmedEnrollment = true;
        // Deal with shallowRef limitation of TanStack table
        resultStore.results = [...resultStore.results];
        // Send change to database
        resultStore.updateResult({
          ...updObj,
          update: {
            confirmedEnrollment: true,
          },
        });
        toast.add({
          title: "Successfully Confirmed Enrollment",
          description: `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`,
        });
        setTimeout(() => {
          showModal.value = false;
          //selectedResult.value = {};
        }, 1000);
      } else {
        console.log("No matching result found");
      }
    }
  };

  // This is the function to pull an applicant off the waitlist
  const makeOffer = (payload: Result) => {
    console.log("Make Offer Function triggered");
    const offer: Result | undefined = resultStore.results
      .filter(
        (item: Result) =>
          item.SchoolID === payload.SchoolID &&
          item.Grade === payload.Grade &&
          item.lotteryList === "Waiting List" &&
          item.queueStatus !== "Offer Pending"
      )
      .sort(
        (a: Result, b: Result) => (a.adjustedRank ?? 0) - (b.adjustedRank ?? 0)
      )[0];
    if (!offer) {
      console.log("No matching offer found.");
      return;
    }
    if (payload.stage === "Check") {
      // Update pending information before pushing new information
      pendingChanges.value.push(
        `Add ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`
      );
      pendingIds.value.push(offer._id);
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Add ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`,
      });
    }
    if (payload.stage === "Submit Changes") {
      // This updates the pinia state directly WOW!
      offer.queueStatus = "Offer Pending";
      offer.queueDate = new Date();
      // Add this to deal with shallowRef limitation of TanStack table
      resultStore.results = [...resultStore.results];
      // Update the result in the database using the Pinia store action updateResult
      resultStore.updateResult({
        ...offer,
        update: {
          queueStatus: "Offer Pending",
          queueDate: new Date(),
        },
      });
      // Also handle the change to the pending offer store add the offer to the pendingOffers
      resultStore.pendingOffers.push(offer); // This just gives the basic row data without the detailed info
      // This was added to fix the shallowRef limitation of TanStack table data reactivity
      resultStore.pendingOffers = [...resultStore.pendingOffers];

      toast.add({
        title: "Successfully Made Offer",
        description: `Added ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`,
      });
    }
    //adjustRankings(offer);
  };

  const moveToList = (payload: Result, list: string, changeLogged: boolean) => {
    console.log("Move to List Payload (composable function): ", payload);
    // Calculate the proper adjustedRank based on the new list
    const maxRank = getMaxRank(payload, resultStore.results, list);
    console.log(`Testing MaxRank Calculation: ${maxRank} on ${list}`);
    // This will mark the pending status and continue to similate the changes
    if (payload.stage === "Check") {
      pendingStatus.value = true;
      buttonText.value = "Submit Changes";
      pendingChanges.value.push(
        `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`
      );
      pendingIds.value.push(payload._id);
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`,
      });
    }
    console.log("Pending Changes: ", pendingChanges.value);
    // Will run everytime to simulate the changes and/or make the changes
    adjustRankings(payload);
    if (
      (payload.lotteryList === "Offered List" ||
        payload.queueStatus === "Offer Pending") &&
      (list === "Forfeited" || list === "Secondary Waitlist")
    ) {
      checkWaitlist(payload);
    }
    // Once changes have been similated/pending, actually make the changes
    if (payload.stage === "Submit Changes") {
      // Disable the button to prevent double clicking
      buttonDisabled.value = true;
      // add the pending changes to the history log
      const changeObj: Change = {
        changes: pendingChanges.value,
        ids: pendingIds.value,
        userId: userStore.value?.user.localAccountId ?? "",
        userEmail: userStore.value?.user.username ?? "",
        userName: userStore.value?.user.name ?? "",
        notes: payload.notes ?? "",
        date: new Date(),
        log: pendingLog.value,
      };
      // Only run if the change has not already been logged
      if (!changeLogged) {
        changeStore.addChange(changeObj);
      }
      // If the original status being decline is from the offered list, remove the Accept - School label
      if (payload.lotteryList === "Offered List" && list === "Forfeited") {
        deleteLabel(payload, "Accept");
      } else if (
        payload.lotteryList === "Waiting List" &&
        list === "Forfeited"
      ) {
        // Remove the original Waitlist - School label if it exists
        deleteLabel(payload, "Waitlist");
      } else if (
        payload.lotteryList === "Forefeited" &&
        list === "Waiting List"
      ) {
        addLabel(payload, "Waitlist");
      }
      // Update the Pinia store for the result being changed to "Decline"
      const updateObj = resultStore.results.find(
        (item: Result) => item._id === payload._id
      );
      if (!updateObj) {
        console.log("No matching result found");
        return;
      }
      updateObj.lotteryList = list;
      updateObj.queueStatus = null;

      const pendingOffer = resultStore.pendingOffers.find(
        (item: Result) => item._id === payload._id
      );

      if (list === "Forfeited") {
        updateObj.adjustedRank = null;
        // Send the decline information to update
        resultStore.updateResult({
          ...updateObj,
          update: {
            lotteryList: list,
            adjustedRank: null,
            queueStatus: null,
          },
        });
        if (!pendingOffer) {
          console.log(`Pending offer with id ${payload._id} not found`);
        } else if (pendingOffer) {
          pendingOffer.lotteryList = list;
          pendingOffer.adjustedRank = null;
          pendingOffer.queueStatus = null;
          resultStore.pendingOffers = [...resultStore.pendingOffers];
        }
      } else {
        updateObj.adjustedRank = maxRank + 1;
        // Send the decline information to update
        resultStore.updateResult({
          ...updateObj,
          update: {
            lotteryList: list,
            adjustedRank: maxRank + 1,
            queueStatus: null,
          },
        });
        if (!pendingOffer) {
          console.log(`Pending offer with id ${payload._id} not found`);
        } else if (pendingOffer) {
          pendingOffer.lotteryList = list;
          pendingOffer.adjustedRank = maxRank + 1;
          pendingOffer.queueStatus = null;
          resultStore.pendingOffers = [...resultStore.pendingOffers];
        }
      }
      // This was added to fix the shallowRef limitation of TanStack table data reactivity
      resultStore.results = [...resultStore.results];
      toast.add({
        title: "Successfully moved student",
        description: `Changed ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`,
      });
      setTimeout(() => {
        showModal.value = false;
        //selectedResult.value = {};
      }, 1000);
    }
  };

  const runAcceptOffer = (payload: Result) => {
    // This will mark the pending status and continue to similate the changes
    if (payload.stage === "Check") {
      console.log("Running accept offer check function");
      pendingStatus.value = true;
      buttonText.value = "Submit Changes";
      pendingChanges.value.push(
        `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`
      );
      pendingIds.value.push(payload._id);
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`,
      });
    }
    // Will run everytime to simulate the changes and/or make the changes
    adjustRankings(payload);
    // Check lower results from applicant
    const lowerResults = resultStore.results.filter(
      (item: Result) =>
        item.submissionId === payload.submissionId &&
        item.ChoiceRank > payload.ChoiceRank
    );
    // Use the getMaxRank util function to get the maxRank of the Offered List
    const maxRank = getMaxRank(payload, resultStore.results, "Offered List");
    // Run the decline offer for the other lower ranked Results
    lowerResults.forEach((item: Result) => {
      let temp = {
        ...item,
        stage: payload.stage,
        action: "Decline lower ranked choices",
      };
      moveToList(temp, "Forfeited", changeLogged.value);
    });
    // After the initial test calculations, mark the change as logged so only it only logs once
    changeLogged.value = true;
    // Once changes have been similated/pending, actually make the changes
    if (payload.stage === "Submit Changes") {
      // Disable the button to prevent double clicking
      buttonDisabled.value = true;
      console.log("Running accept offer submit function");
      // add the pending changes to the history log
      const changeObj: Change = {
        changes: pendingChanges.value,
        ids: pendingIds.value,
        userId: userStore.value?.user.localAccountId ?? "",
        userEmail: userStore.value?.user.username ?? "",
        userName: userStore.value?.user.name ?? "",
        notes: payload.notes ?? "",
        date: new Date(),
        log: pendingLog.value,
      };
      changeStore.addChange(changeObj);
      // Update the Pinia store for the result being changed to "Offered List"
      const acceptObj = resultStore.results.find(
        (item: Result) => item._id === payload._id
      );
      if (!acceptObj) {
        throw new Error(`Result with id ${payload._id} not found`);
      }
      const pendingOffer = resultStore.pendingOffers.find(
        (item: Result) => item._id === payload._id
      );

      acceptObj.lotteryList = "Offered List";
      acceptObj.adjustedRank = maxRank + 1;
      acceptObj.queueStatus = null;
      resultStore.results = [...resultStore.results];
      if (!pendingOffer) {
        console.log(`Pending offer with id ${payload._id} not found`);
      } else if (pendingOffer) {
        pendingOffer.lotteryList = "Offered List";
        pendingOffer.adjustedRank = maxRank + 1;
        pendingOffer.queueStatus = null;
        resultStore.pendingOffers = [...resultStore.pendingOffers];
      }
      // Add the Accept - School label
      addLabel(payload, "Accept");
      // Remove the Waitlist - School label
      deleteLabel(payload, "Waitlist");
      // Send the offer information to update
      resultStore.updateResult({
        ...payload,
        update: {
          lotteryList: "Offered List",
          adjustedRank: maxRank + 1,
          queueStatus: null,
        },
      });
      toast.add({
        title: "Successfully accepted offer",
        description: `Changed ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`,
      });

      setTimeout(() => {
        showModal.value = false;
      }, 1000);
    }
  };

  const runAction = (payload: Result) => {
    console.log("event: ", event);
    if (payload.action === "Remove") {
      moveToList(payload, "Forfeited", false);
    } else if (payload.action === "Add Wait") {
      moveToList(payload, "Waiting List", false);
    } else if (payload.action === "Add Offer") {
      runAcceptOffer(payload);
    } else if (payload.action === "Secondary") {
      moveToList(payload, "Secondary Waitlist", false);
    } else if (payload.action === "Enroll") {
      confirmEnrollment(payload);
    } else if (payload.action === "Accept") {
      runAcceptOffer(payload);
    } else if (payload.action === "Decline") {
      moveToList(payload, "Forfeited", false);
    } else if (payload.action === "Test Action") {
      console.log("Test Action: ", payload);
      console.log("userStore user: ", userStore.value.user);
      buttonText.value = "Checking...";
      toast.add({
        title: "Test Action from Composable",
        description: "This is a test action toast running from composable.",
      });
    } else {
      //if (user.value) {
      //  console.log(user.value.id, user.value.email);
      //} else {
      //  console.log("User is not logged in");
      //}
      console.log("runAction:", payload.action);
    }
  };
  return {
    // All we need to use is the runAction function which then
    // takes the "action" string to trigger the proper functions
    runAction,
    buttonText,
    buttonDisabled,
    pendingChanges,
    pendingIds,
    pendingLog,
    pendingStatus,
    showModal,
  };
}
