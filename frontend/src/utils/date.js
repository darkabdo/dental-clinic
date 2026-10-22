export const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDisplayDateTime = (dateString, time) => {
  const date = formatDisplayDate(dateString);
  if (!time) return date;
  return `${date} at ${time}`;
};

/** Parts for reception “calendar agenda” day headers. */
export const formatCalendarAgendaParts = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return {
    dowShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dowLong: d.toLocaleDateString('en-US', { weekday: 'long' }),
    dayNum: d.getDate(),
    monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
    monthYear: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
};
