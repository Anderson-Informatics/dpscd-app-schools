import JsonExcel from "vue-json-excel3";

export default defineNuxtPlugin((app) => {
  app.vueApp.component("DownloadExcel", JsonExcel);
});
