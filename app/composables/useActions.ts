import type { Result } from '~~/types/result'
import type { Change } from '~~/types/change'
import type { School } from '~~/types/school'
import type { Qualification } from '~~/types/qualification'
import type { Submission } from '~~/types/submission'

const generateClientId = () => {
  // Keep IDs short and hex-like to stay compatible with existing string _id usage.
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24)
}

export default function () {
  const toast = useToast()
  const resultStore = useResultStore()
  const changeStore = useChangeStore()
  // const submissionStore = useSubmissionStore()
  const settingsStore = useSettingsStore()
  const userStore = useAppUser()

  const showModal = ref<boolean>(false)
  const pendingChanges = ref<string[]>([])
  const pendingStatus = ref<boolean>(false)
  const buttonText = ref<string>('Check')
  const buttonDisabled = ref<boolean>(false)
  const pendingIds = ref<string[]>([])
  const pendingLog = ref<Array<{ submissionId: string; change: string } | null>>([])
  const changeLogged = ref<boolean>(false)

  const addLabel = async (payload: Result, type: string) => {
    if (settingsStore.settings.applyLabels) {
      await resultStore.addLabel(payload, type)
    }
  }

  const deleteLabel = async (payload: Result, type: string) => {
    if (settingsStore.settings.applyLabels) {
      await resultStore.deleteLabel(payload, type)
    }
  }

  const addResult = async (payload: Qualification, submission: Submission) => {
    console.log(`Add Result function triggered: ${JSON.stringify(payload)}`)
    const newRank = getNewRank(payload, resultStore.results)
    const offers = resultStore.results.filter(
      (item: Result) =>
        item.SchoolID === payload.SchoolID &&
        item.Grade === payload.GradeEntering &&
        item.lotteryList === 'Offered List'
    )
    const waitlist = resultStore.results.filter(
      (item: Result) =>
        item.SchoolID === payload.SchoolID &&
        item.Grade === payload.GradeEntering &&
        item.lotteryList === 'Waiting List'
    )
    let newList = ''
    if (waitlist.length > 0) {
      console.log(`Found ${waitlist.length} applicants on the waiting list for ${payload.School}`)
      newList = 'Waiting List'
    } else if (offers.length > 0) {
      console.log(`Found ${offers.length} applicants on the offered list for ${payload.School}`)
      newList = 'Offered List'
    } else {
      console.log(`No applicants found for ${payload.School} in the offered or waiting list`)
    }
    const newResult: Result = {
      _id: generateClientId(),
      submissionId: payload.submissionId,
      rank: newRank,
      Grade: payload.GradeEntering,
      SchoolID: payload.SchoolID,
      School: payload.School,
      FirstName: submission.FirstName,
      LastName: submission.LastName,
      ChoiceRank: 0,
      Priority: 0,
      TestDate: new Date(),
      lotteryList: newList,
      comment: 'Added by user',
      adjustedRank:
        getMaxRank(payload.SchoolID, payload.GradeEntering, resultStore.results, newList) + 1,
      submissionDate: submission.submissionDate
    }
    console.log(`New Result: ${JSON.stringify(newResult)}`)
    if (payload.stage === 'Check') {
      console.log('Add Result Check stage triggered')
      pendingStatus.value = true
      buttonText.value = 'Submit Changes'
      pendingChanges.value.push(
        `Add ${payload.FullName} at ${payload.School}, grade ${payload.GradeEntering} to placement results`
      )
      pendingIds.value.push(payload._id)
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Add ${payload.FullName} at ${payload.School}, grade ${payload.GradeEntering} to placement results`
      })
    } else if (payload.stage === 'Submit Changes') {
      console.log('Add Result Submit Changes stage triggered')
      buttonDisabled.value = true
      pendingStatus.value = false
      try {
        // add the pending changes to the history log
        const changeObj: Change = {
          changes: pendingChanges.value,
          ids: pendingIds.value,
          userId: userStore.value?.user.localAccountId ?? '',
          userEmail: userStore.value?.user.username ?? '',
          userName: userStore.value?.user.name ?? '',
          notes: payload.notes ?? '',
          date: new Date(),
          log: pendingLog.value
        }
        await changeStore.addChange(changeObj)
        await resultStore.insertResult(newResult)

        toast.add({
          title: 'Successfully added new result',
          description: `Changed ${payload.FullName} at ${payload.School}, grade ${payload.GradeEntering} to placement results`
        })
        setTimeout(() => {
          showModal.value = false
          // selectedResult.value = {};
        }, 1000)
      } catch (e: unknown) {
        toast.add({
          title: 'Unable to add result',
          description: e instanceof Error ? e.message : 'Unexpected error while adding result.'
        })
        buttonDisabled.value = false
      }
    }
  }

  const adjustRankings = async (payload: Result) => {
    console.log('Adjust Rankings function triggered')
    // filter to the same school, grade, and lotteryList and lower ranked results
    const filtered = resultStore.results.filter((item: Result) =>
      item.SchoolID === payload.SchoolID &&
      item.Grade === payload.Grade &&
      item.lotteryList === payload.lotteryList &&
      item.adjustedRank !== undefined &&
      payload.adjustedRank !== undefined
        ? item.adjustedRank !== null &&
          payload.adjustedRank !== null &&
          item.adjustedRank > payload.adjustedRank
        : false
    )
    // This will prevent the additional "change" of not moving any up the forfeited list
    if (payload.lotteryList === 'Forfeited') {
      return
    }
    // Create an Array of ids from the lower ranked results
    const ids: string[] = filtered.map((item: Result) => item._id)
    if (payload.stage === 'Check') {
      // Add info to pending changes array to display as interim step
      pendingChanges.value.push(`Move ${ids.length} applicants up the ${payload.lotteryList}`)
    }
    if (payload.stage === 'Submit Changes') {
      // Send the ids to update the list rankings
      await resultStore.adjustRankings(ids)
      // Update the filtered Pinia Store
      filtered.forEach((item) => {
        item.adjustedRank = (item.adjustedRank ?? 0) - 1
      })
      // Deal with shallowRef limitation of TanStack table
      resultStore.results = [...resultStore.results]
      toast.add({
        title: 'Waitlist Successfully Adjusted',
        description: `Moved ${ids.length} applicants up the ${payload.lotteryList}`
      })
    }
  }

  // This will check for available seats and run the makeOffer function if seats available
  const checkWaitlist = async (payload: Result) => {
    console.log('Check Waitlist Function Triggered')
    // Get the capacity for the selected school
    const school = resultStore.schools.find((item: School) => item.SchoolID === payload.SchoolID)

    if (!school || !school.Capacity[payload.Grade]) {
      console.error('School or capacity not found for the given grade.')
      return
    }

    const capacity = school.Capacity[payload.Grade]

    if (capacity === undefined) {
      console.error('Capacity is undefined for the given grade.')
      return
    }

    // Calculate the number of seats filled
    const filled = resultStore.results.filter(
      (item: Result) =>
        item.SchoolID === payload.SchoolID &&
        item.Grade === payload.Grade &&
        // Fix this to account for offer pending students
        (item.lotteryList === 'Offered List' || item.queueStatus === 'Offer Pending')
    ).length
    if (filled <= capacity) {
      await makeOffer(payload)
    }
  }

  const confirmEnrollment = async (payload: Result) => {
    // This will mark the pending status and continue to simulate the changes
    if (payload.stage === 'Check') {
      pendingStatus.value = true
      buttonText.value = 'Submit Changes'
      pendingChanges.value.push(
        `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`
      )
      pendingIds.value.push(payload._id)
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`
      })
    }
    if (payload.stage === 'Submit Changes') {
      const updObj = resultStore.results.find((item: Result) => item._id === payload._id)
      if (!updObj) {
        console.log('No matching result found')
        toast.add({
          title: 'Unable to update result',
          description: `${payload.FirstName} ${payload.LastName} could not be found in the current results list.`
        })
        return
      }
      // Disable the button to prevent double clicking
      buttonDisabled.value = true
      try {
        // add the pending changes to the history log
        const changeObj: Change = {
          changes: pendingChanges.value,
          ids: pendingIds.value,
          userId: userStore.value?.user.localAccountId ?? '',
          userEmail: userStore.value?.user.username ?? '',
          userName: userStore.value?.user.name ?? '',
          notes: payload.notes ?? '',
          date: new Date(),
          log: pendingLog.value
        }
        await changeStore.addChange(changeObj)
        await resultStore.updateResult({
          ...updObj,
          update: {
            confirmedEnrollment: true
          }
        })
        // Update Pinia store for updated object
        updObj.confirmedEnrollment = true
        // Deal with shallowRef limitation of TanStack table
        resultStore.results = [...resultStore.results]
        toast.add({
          title: 'Successfully Confirmed Enrollment',
          description: `Confirm Enrollment for ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade}`
        })
        setTimeout(() => {
          showModal.value = false
          // selectedResult.value = {};
        }, 1000)
      } catch (e: unknown) {
        toast.add({
          title: 'Unable to confirm enrollment',
          description:
            e instanceof Error ? e.message : 'Unexpected error while confirming enrollment.'
        })
        buttonDisabled.value = false
      }
    }
  }

  // This is the function to pull an applicant off the waitlist
  const makeOffer = async (payload: Result) => {
    console.log('Make Offer Function triggered')
    const offer: Result | undefined = resultStore.results
      .filter(
        (item: Result) =>
          item.SchoolID === payload.SchoolID &&
          item.Grade === payload.Grade &&
          item.lotteryList === 'Waiting List' &&
          item.queueStatus !== 'Offer Pending'
      )
      .sort((a: Result, b: Result) => (a.adjustedRank ?? 0) - (b.adjustedRank ?? 0))[0]
    if (!offer) {
      console.log('No matching offer found.')
      return
    }
    if (payload.stage === 'Check') {
      // Update pending information before pushing new information
      pendingChanges.value.push(
        `Add ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`
      )
      pendingIds.value.push(offer._id)
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Add ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`
      })
    }
    if (payload.stage === 'Submit Changes') {
      const queueDate = new Date()
      // Update the result in the database using the Pinia store action updateResult
      await resultStore.updateResult({
        ...offer,
        update: {
          queueStatus: 'Offer Pending',
          queueDate
        }
      })
      // Add Offer Pending label to submittable
      await addLabel(offer, 'Offer Pending')
      // This updates the pinia state directly WOW!
      offer.queueStatus = 'Offer Pending'
      offer.queueDate = queueDate
      // Add this to deal with shallowRef limitation of TanStack table
      resultStore.results = [...resultStore.results]
      // Also handle the change to the pending offer store add the offer to the pendingOffers
      resultStore.pendingOffers.push(offer)
      // This was added to fix the shallowRef limitation of TanStack table data reactivity
      resultStore.pendingOffers = [...resultStore.pendingOffers]

      toast.add({
        title: 'Successfully Made Offer',
        description: `Added ${offer.FirstName} ${offer.LastName} at ${offer.School}, grade ${offer.Grade} to 'Offer Pending' list`
      })
    }
    // adjustRankings(offer);
  }

  const moveToList = async (payload: Result, list: string, changeLogged: boolean) => {
    console.log('Move to List Payload (composable function): ', payload)
    // Calculate the proper adjustedRank based on the new list
    const maxRank = getMaxRank(payload.SchoolID, payload.Grade, resultStore.results, list)
    console.log(`Testing MaxRank Calculation: ${maxRank} on ${list}`)
    // This will mark the pending status and continue to similate the changes
    if (payload.stage === 'Check') {
      pendingStatus.value = true
      buttonText.value = 'Submit Changes'
      pendingChanges.value.push(
        `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`
      )
      pendingIds.value.push(payload._id)
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`
      })
    }
    console.log('Pending Changes: ', pendingChanges.value)
    // Will run everytime to simulate the changes and/or make the changes
    await adjustRankings(payload)
    if (
      (payload.lotteryList === 'Offered List' || payload.queueStatus === 'Offer Pending') &&
      (list === 'Forfeited' || list === 'Secondary Waitlist')
    ) {
      await checkWaitlist(payload)
    }
    // Once changes have been similated/pending, actually make the changes
    if (payload.stage === 'Submit Changes') {
      const updateObj = resultStore.results.find((item: Result) => item._id === payload._id)
      if (!updateObj) {
        console.log('No matching result found')
        toast.add({
          title: 'Unable to update result',
          description: `${payload.FirstName} ${payload.LastName} could not be found in the current results list.`
        })
        return
      }
      // Disable the button to prevent double clicking
      buttonDisabled.value = true
      const pendingOffer = resultStore.pendingOffers.find(
        (item: Result) => item._id === payload._id
      )
      try {
        const nextAdjustedRank = list === 'Forfeited' ? null : maxRank + 1
        // add the pending changes to the history log
        const changeObj: Change = {
          changes: pendingChanges.value,
          ids: pendingIds.value,
          userId: userStore.value?.user.localAccountId ?? '',
          userEmail: userStore.value?.user.username ?? '',
          userName: userStore.value?.user.name ?? '',
          notes: payload.notes ?? '',
          date: new Date(),
          log: pendingLog.value
        }
        // Only run if the change has not already been logged
        if (!changeLogged) {
          await changeStore.addChange(changeObj)
        }
        // If the original status being decline is from the offered list, remove the Accept - School label
        if (payload.lotteryList === 'Offered List' && list === 'Forfeited') {
          await deleteLabel(payload, 'Accept')
        } else if (payload.lotteryList === 'Waiting List' && list === 'Forfeited') {
          // Remove the original Waitlist - School label if it exists
          await deleteLabel(payload, 'Waitlist')
          // Also check if this forfeiture is from the Offer Pending list, then delete the Offer Pending label
          if (payload.queueStatus === 'Offer Pending') {
            await deleteLabel(payload, 'Offer Pending')
          }
        } else if (payload.lotteryList === 'Forefeited' && list === 'Waiting List') {
          // Add Waitlist label back when moving out of forfeited
          await addLabel(payload, 'Waitlist')
        }
        // Send the decline information to update
        await resultStore.updateResult({
          ...updateObj,
          update: {
            lotteryList: list,
            adjustedRank: nextAdjustedRank,
            queueStatus: null
          }
        })
        updateObj.lotteryList = list
        updateObj.adjustedRank = nextAdjustedRank
        updateObj.queueStatus = null
        if (!pendingOffer) {
          console.log(`Pending offer with id ${payload._id} not found`)
        } else if (pendingOffer) {
          pendingOffer.lotteryList = list
          pendingOffer.adjustedRank = nextAdjustedRank
          pendingOffer.queueStatus = null
          resultStore.pendingOffers = [...resultStore.pendingOffers]
        }
        // This was added to fix the shallowRef limitation of TanStack table data reactivity
        resultStore.results = [...resultStore.results]
        toast.add({
          title: 'Successfully moved student',
          description: `Changed ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to '${list}'`
        })
        setTimeout(() => {
          showModal.value = false
          // selectedResult.value = {};
        }, 1000)
      } catch (e: unknown) {
        toast.add({
          title: 'Unable to move student',
          description: e instanceof Error ? e.message : 'Unexpected error while moving student.'
        })
        buttonDisabled.value = false
      }
    }
  }

  const runAcceptOffer = async (payload: Result) => {
    // This will mark the pending status and continue to similate the changes
    if (payload.stage === 'Check') {
      console.log('Running accept offer check function')
      pendingStatus.value = true
      buttonText.value = 'Submit Changes'
      pendingChanges.value.push(
        `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`
      )
      pendingIds.value.push(payload._id)
      pendingLog.value.push({
        submissionId: payload.submissionId,
        change: `Change ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`
      })
    }
    // Will run everytime to simulate the changes and/or make the changes
    await adjustRankings(payload)
    // Check lower results from applicant
    const lowerResults = resultStore.results.filter(
      (item: Result) =>
        item.submissionId === payload.submissionId &&
        item.ChoiceRank > payload.ChoiceRank &&
        item.lotteryList !== 'Forfeited' // This will stop the redudant Forfeiting of a Forfetied seat.
    )
    // Use the getMaxRank util function to get the maxRank of the Offered List
    const maxRank = getMaxRank(payload.SchoolID, payload.Grade, resultStore.results, 'Offered List')
    // Run the decline offer for the other lower ranked Results
    for (const item of lowerResults) {
      const temp = {
        ...item,
        stage: payload.stage,
        action: 'Decline lower ranked choices'
      }
      await moveToList(temp, 'Forfeited', changeLogged.value)
    }
    // After the initial test calculations, mark the change as logged so only it only logs once
    changeLogged.value = true
    // Once changes have been similated/pending, actually make the changes
    if (payload.stage === 'Submit Changes') {
      console.log('Running accept offer submit function')
      const acceptObj = resultStore.results.find((item: Result) => item._id === payload._id)
      if (!acceptObj) {
        toast.add({
          title: 'Unable to update result',
          description: `${payload.FirstName} ${payload.LastName} could not be found in the current results list.`
        })
        return
      }
      // Disable the button to prevent double clicking
      buttonDisabled.value = true
      const pendingOffer = resultStore.pendingOffers.find(
        (item: Result) => item._id === payload._id
      )
      try {
        // add the pending changes to the history log
        const changeObj: Change = {
          changes: pendingChanges.value,
          ids: pendingIds.value,
          userId: userStore.value?.user.localAccountId ?? '',
          userEmail: userStore.value?.user.username ?? '',
          userName: userStore.value?.user.name ?? '',
          notes: payload.notes ?? '',
          date: new Date(),
          log: pendingLog.value
        }
        await changeStore.addChange(changeObj)
        // Add the Accept - School label
        await addLabel(payload, 'Accept')
        // Remove the OP - School label
        await deleteLabel(payload, 'Offer Pending')
        // Remove the Waitlist - School label
        await deleteLabel(payload, 'Waitlist')
        // Send the offer information to update
        await resultStore.updateResult({
          ...payload,
          update: {
            lotteryList: 'Offered List',
            adjustedRank: maxRank + 1,
            queueStatus: null
          }
        })
        // Update the Pinia store for the result being changed to "Offered List"
        acceptObj.lotteryList = 'Offered List'
        acceptObj.adjustedRank = maxRank + 1
        acceptObj.queueStatus = null
        // Deal with shallowRef limitation of TanStack table
        resultStore.results = [...resultStore.results]
        if (!pendingOffer) {
          console.log(`Pending offer with id ${payload._id} not found`)
        } else if (pendingOffer) {
          pendingOffer.lotteryList = 'Offered List'
          pendingOffer.adjustedRank = maxRank + 1
          pendingOffer.queueStatus = null
          resultStore.pendingOffers = [...resultStore.pendingOffers]
        }
        toast.add({
          title: 'Successfully accepted offer',
          description: `Changed ${payload.FirstName} ${payload.LastName} at ${payload.School}, grade ${payload.Grade} from '${payload.lotteryList}' to 'Offered List'`
        })

        setTimeout(() => {
          showModal.value = false
        }, 1000)
      } catch (e: unknown) {
        toast.add({
          title: 'Unable to accept offer',
          description: e instanceof Error ? e.message : 'Unexpected error while accepting offer.'
        })
        buttonDisabled.value = false
      }
    }
  }

  const runAction = async (payload: Result) => {
    console.log('event: ', event)
    if (payload.action === 'Remove') {
      await moveToList(payload, 'Forfeited', false)
    } else if (payload.action === 'Add Wait') {
      await moveToList(payload, 'Waiting List', false)
    } else if (payload.action === 'Add Offer') {
      await runAcceptOffer(payload)
    } else if (payload.action === 'Secondary') {
      await moveToList(payload, 'Secondary Waitlist', false)
    } else if (payload.action === 'Enroll') {
      await confirmEnrollment(payload)
    } else if (payload.action === 'Accept') {
      await runAcceptOffer(payload)
    } else if (payload.action === 'Decline') {
      await moveToList(payload, 'Forfeited', false)
    } else if (payload.action === 'Test Action') {
      console.log('Test Action: ', payload)
      console.log('userStore user: ', userStore.value.user)
      buttonText.value = 'Checking...'
      toast.add({
        title: 'Test Action from Composable',
        description: 'This is a test action toast running from composable.'
      })
    } else {
      // if (user.value) {
      //  console.log(user.value.id, user.value.email);
      // } else {
      //  console.log("User is not logged in");
      // }
      console.log('runAction:', payload.action)
    }
  }

  return {
    // All we need to use is the runAction function which then
    // takes the "action" string to trigger the proper functions
    runAction,
    addResult,
    buttonText,
    buttonDisabled,
    pendingChanges,
    pendingIds,
    pendingLog,
    pendingStatus,
    showModal
  }
}
