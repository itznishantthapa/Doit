const AVAILABILITY_MONTHS = 3;

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const buildAvailabilityFromBusyDates = (busyDatesList = []) => {
  const bookedDates = new Set(busyDatesList);
  const availableDates = new Set();
  const today = getToday();
  const totalDays = AVAILABILITY_MONTHS * 30;

  for (let offset = 0; offset <= totalDays; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const dateString = toDateString(date);

    if (!bookedDates.has(dateString)) {
      availableDates.add(dateString);
    }
  }

  return { bookedDates, availableDates };
};

export const getNearestAvailableDate = (availableDates) => {
  const nearest = [...availableDates].sort()[0];
  return nearest ? new Date(`${nearest}T12:00:00`) : null;
};
