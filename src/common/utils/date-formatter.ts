export function dateFormatter(date: string) {
  const [localDate, localTime] = date.split('T');
  const [year, month, day] = localDate.split('-');
  const time = localTime.split('.')[0];
  return `${year}년 ${month}월 ${day}일 ${time}`;
}
