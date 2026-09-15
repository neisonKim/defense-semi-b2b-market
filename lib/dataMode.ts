export function databaseModeEnabled() {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "database";
}
