import SettingModel from "~~/server/models/setting.model";

export default defineEventHandler(async (event) => {
  const results = await SettingModel.find();

  return results[0];
});
