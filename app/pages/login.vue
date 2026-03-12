<script setup lang="ts">
import { useMSAuth } from '~/composables/useMSAuth'

definePageMeta({
  title: 'Login',
  description: 'Login to your account',
  layout: 'unauthorized'
})

const msAuth = useMSAuth()

async function login() {
  await msAuth.signIn()
}

const providers = [
  {
    label: 'DPSCD Microsoft SSO',
    icon: 'i-simple-icons-microsoft',
    onClick: () => {
      login()
      // toast.add({ title: 'Microsoft', description: 'Login with Microsoft' })
    }
  }
]
</script>

<template>
  <div class="flex flex-col h-screen items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :providers="providers" title="Welcome back!" icon="i-lucide-lock">
        <!--
        <template #footer>
          By signing in, you agree to our <ULink to="#" class="text-(--ui-primary) font-medium">Terms of Service</ULink>
          .
        </template>
-->
        <template #footer>
          To access this site you must login with an authorized District account.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
