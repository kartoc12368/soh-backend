export function incrementDate(date: Date): Date {
  const newDate = new Date(date);
  newDate?.setDate(newDate?.getDate());
  return newDate;
}

export async function todayDate() {
  return await new Date().getFullYear();
}
