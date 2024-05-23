export function incrementDate(date: Date): Date {
  const newDate = new Date(date);
  newDate?.setDate(newDate?.getDate());
  return newDate;
}
