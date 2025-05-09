import { createSharedComposable } from "@vueuse/core";

const _useDashboard = () => {
  const route = useRoute();
  const router = useRouter();
  const isNotificationsSlideoverOpen = ref(false);

  defineShortcuts({
    "g-h": () => router.push("/"),
    "g-s": () => router.push("/submissions"),
    "g-p": () => router.push("/placements"),
    "g-q": () => router.push("/queue"),
    "g-c": () => router.push("/capacity"),
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
