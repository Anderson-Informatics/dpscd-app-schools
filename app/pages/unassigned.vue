<script setup lang="ts">
definePageMeta({
  layout: 'unauthorized'
})
</script>

<template>
  <section class="w-full max-w-3xl mt-10 px-4">
    <div class="status-glow rounded-2xl p-[1px]">
      <UPageCard
        title="Account Pending Activation"
        variant="subtle"
        class="overflow-hidden"
      >
        <div class="flex flex-col gap-6 py-2">
          <div class="flex items-center gap-3 fade-in">
            <span class="icon-orb">
              <UIcon name="i-lucide-shield-check" class="size-6 text-emerald-600" />
            </span>
            <p class="text-sm font-medium text-(--ui-text-muted)">
              Login successful
            </p>
          </div>

          <div class="space-y-4">
            <div class="message-row fade-in delay-1">
              <UIcon name="i-lucide-user-check" class="size-5 text-blue-600" />
              <p class="text-(--ui-text) leading-7">
                You have successfully logged in but we need to confirm a few things on our end.
              </p>
            </div>

            <div class="message-row fade-in delay-2">
              <UIcon name="i-lucide-mail-check" class="size-5 text-amber-600" />
              <p class="text-(--ui-text) leading-7">
                A site administrator will review your account for activation within the next few days. If approved for an account, the site administrator will let you know via email and you will be able to access the full site at that time.
              </p>
            </div>

            <div class="message-row fade-in delay-3">
              <UIcon name="i-lucide-heart-handshake" class="size-5 text-rose-600" />
              <p class="text-(--ui-text) leading-7">
                Thank you for your patience.
              </p>
            </div>
          </div>
        </div>
      </UPageCard>
    </div>
  </section>
</template>

<style scoped>
.status-glow {
  background: linear-gradient(120deg, rgba(16, 185, 129, 0.35), rgba(59, 130, 246, 0.25), rgba(245, 158, 11, 0.28));
  background-size: 160% 160%;
  animation: glowShift 8s ease infinite;
}

.icon-orb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.14);
  animation: floatY 3.5s ease-in-out infinite;
}

.message-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: start;
}

.fade-in {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 0.55s ease-out forwards;
}

.delay-1 {
  animation-delay: 0.08s;
}

.delay-2 {
  animation-delay: 0.18s;
}

.delay-3 {
  animation-delay: 0.28s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

@keyframes glowShift {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}
</style>
