<script setup lang="ts">
const open = ref(false)

const props = defineProps({
  result: {
    type: Object,
  },
  open: {
    type: Boolean,
  },
  changes: {
    type: Array,
  },
  pending: {
    type: Boolean,
  },
  button: {
    type: String,
  },
});

const emit = defineEmits(["close-modal", "run-action"]);

const action = ref("Please select an action");
const notes = ref("");

const runAction = () => {
  if (!props.result) {
    console.error("props.result is undefined");
    return;
  }
  emit("run-action", {
    action: action.value,
    stage: props.button,
    _id: props.result._id,
    submissionId: props.result.submissionId,
    FirstName: props.result.FirstName,
    LastName: props.result.LastName,
    School: props.result.School,
    SchoolID: props.result.SchoolID,
    Grade: props.result.Grade,
    lotteryList: props.result.lotteryList,
    newLotteryList: "Forfeited",
    adjustedRank: props.result.adjustedRank,
    queueStatus: props.result.queueStatus,
    notes: notes.value,
  });
  // This will hopefully reset the form after submission
  if (props.button === "Submit Changes") {
    action.value = "Please select an action";
    notes.value = "";
  }
};
</script>

<template>
  <UModal v-model:open="open" title="Placement Update Form"
    description="This is useful when you want a form in a Modal." :ui="{ footer: 'justify-end' }">
    <UButton label="Open" color="neutral" variant="subtle" />

    <template #body>
      The form goes here.
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
      <UButton label="Submit" color="neutral" />
    </template>
  </UModal>
</template>