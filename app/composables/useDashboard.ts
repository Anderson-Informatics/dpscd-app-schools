import { createSharedComposable } from "@vueuse/core";

const _useDashboard = () => {
  const route = useRoute();
  const router = useRouter();
  const isNotificationsSlideoverOpen = ref(false);

  defineShortcuts({
    "g-h": () => router.push("/"),
    "g-p": () => router.push("/placements"),
    "g-q": () => router.push("/queue"),
    "g-i": () => router.push("/inbox"),
    "g-c": () => router.push("/customers"),
    "g-s": () => router.push("/settings"),
    n: () =>
      (isNotificationsSlideoverOpen.value =
        !isNotificationsSlideoverOpen.value),
  });

  watch(
    () => route.fullPath,
    () => {
      isNotificationsSlideoverOpen.value = false;
    }
  );

  return {
    isNotificationsSlideoverOpen,
  };
};

export const useDashboard = createSharedComposable(_useDashboard);
