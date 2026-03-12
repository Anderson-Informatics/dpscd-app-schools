<script setup lang="ts">
const { year } = useAppYear()
</script>

<template>
  <UBadge
    :label="`Year ${year}`"
    color="neutral"
    variant="subtle"
  />
</template>
