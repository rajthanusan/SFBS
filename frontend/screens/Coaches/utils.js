import config from '../../config';

export const API_URL = `${config.API_URL}/api/v1`;

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const convertTo24HourFormat = (time) => {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':');

  if (modifier === 'PM' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  } else if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }

  return `${hours}:${minutes}`;
};

export const convertTimeSlotTo24HourFormat = (timeSlot) => {
  const [startTime, endTime] = timeSlot.split(' - ');
  return `${convertTo24HourFormat(startTime)} - ${convertTo24HourFormat(endTime)}`;
};

