// The booking modal lives in the Header; anything else on the page opens it with this event.
export const OPEN_BOOKING_EVENT = "open-booking";

export function openBooking() {
  window.dispatchEvent(new Event(OPEN_BOOKING_EVENT));
}
