<script setup lang="ts">
const router = useRouter()
onMounted(() => {
  // This will run when the component is mounted
  // You can perform any setup or initialization here if needed
  router.push('/placements')
})
</script>

<template>
  <div class="flex">
    <h1 class="text-2xl font-bold">
      Redirecting to placements...
    </h1>
  </div>
</template>

