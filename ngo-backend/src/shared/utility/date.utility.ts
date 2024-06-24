export function incrementDate(date: Date): Date {
  const newDate = new Date(date);
  newDate?.setDate(newDate?.getDate());
  return newDate;
}

export async function todayDate() {
  return await new Date().getFullYear();
}

export async function getFormattedDate(dateStr) {
  const dateObj = new Date(dateStr);

  const padZero = (num) => num.toString().padStart(2, '0');

  const day = padZero(dateObj.getDate());
  const month = padZero(dateObj.getMonth() + 1); // Months are zero-based
  const year = dateObj.getFullYear().toString().slice(-2);

  const hours = padZero(dateObj.getHours());
  const minutes = padZero(dateObj.getMinutes());
  const seconds = padZero(dateObj.getSeconds());

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return await formattedDate;
}
