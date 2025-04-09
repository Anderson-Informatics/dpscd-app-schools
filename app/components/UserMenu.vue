<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMSAuth } from "~/composables/useMSAuth"
import { useAppUser } from "~/composables/useAppUser"

const userStore = useAppUser()
const msAuth = useMSAuth()
const isAuthenticated = msAuth.isAuthenticated()

const profileImage = ref<string>('')
const userInfo = ref<{ name: string; username?: string }>({ name: 'Not logged in' })

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const user = ref({
  name: 'Test',
  avatar: {
    src: 'https://github.com/benjamincanac.png',
    alt: 'Test'
  }
})

const logout = async (accountId: string) => {
  if (accountId) {
    await msAuth.signOut(accountId);
  } else {
    console.log("No account id");
  }
}

const getProfileImage = async () => {
  const accessToken = await msAuth.acquireTokenSilent();
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/photo/$value",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.status != 404) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  }
}

onMounted(async () => {
  if (isAuthenticated) {
    userInfo.value = userStore.value.user;

    // Ensure profileImage can handle null
    profileImage.value = (await getProfileImage()) || '';

    // Ensure userImage in the store can handle null
    userStore.value.avatar = { src: profileImage.value, alt: userInfo.value.name };
    user.value.name = userStore.value.user.name;
    user.value.avatar = { src: profileImage.value, alt: userInfo.value.name };
  }
});

console.log('userStore: ', userStore.value)

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: userStore.value.user.username,
  avatar: user.value.avatar,
}], [{
  label: 'Profile',
  icon: 'i-lucide-user'
}, {
  label: 'Settings',
  icon: 'i-lucide-settings',
  to: '/settings'
}], [{
  label: 'Theme',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Primary',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color
      }
    }))
  }, {
    label: 'Neutral',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color
      }
    }))
  }]
}, {
  label: 'Appearance',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()

      colorMode.preference = 'light'
    }
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    }
  }]
}],
/* 
[{
  label: 'Templates',
  icon: 'i-lucide-layout-template',
  children: [{
    label: 'Starter',
    to: 'https://ui-pro-starter.nuxt.dev/'
  }, {
    label: 'Landing',
    to: 'https://landing-template.nuxt.dev/'
  }, {
    label: 'Docs',
    to: 'https://docs-template.nuxt.dev/'
  }, {
    label: 'SaaS',
    to: 'https://saas-template.nuxt.dev/'
  }, {
    label: 'Dashboard',
    to: 'https://dashboard-template.nuxt.dev/',
    checked: true,
    type: 'checkbox'
  }]
}], [{
  label: 'Documentation',
  icon: 'i-lucide-book-open',
  to: 'https://ui.nuxt.com/getting-started/installation/pro/nuxt',
  target: '_blank'
}, {
  label: 'GitHub repository',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/nuxt-ui-pro/dashboard',
  target: '_blank'
}, {
  label: 'Upgrade to Pro',
  icon: 'i-lucide-rocket',
  to: 'https://ui.nuxt.com/pro/purchase',
  target: '_blank'
}],
*/
[{
  label: 'Log out',
  icon: 'i-lucide-log-out',
  onSelect(e) {
    e.preventDefault()
    logout(userStore.value.user.homeAccountId)
  }
}]]))
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton v-bind="{
      ...user,
      label: collapsed ? undefined : user?.name,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-(--ui-bg-elevated)" :ui="{
      trailingIcon: 'text-(--ui-text-dimmed)'
    }" />

    <template #chip-leading="{ item }">
      <span :style="{ '--chip': `var(--color-${(item as any).chip}-400)` }"
        class="ms-0.5 size-2 rounded-full bg-(--chip)" />
    </template>
  </UDropdownMenu>
</template>
