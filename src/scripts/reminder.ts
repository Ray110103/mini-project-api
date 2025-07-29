import cron from "node-cron";

export const reminderSchedule = () => {
  cron.schedule("*/5 * * * * *", () => {
    // add logic here
    console.log("Running a task every 5 seconds");
  });
};
