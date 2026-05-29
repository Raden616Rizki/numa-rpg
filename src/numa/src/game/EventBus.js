/**
 * Sends an event from Phaser to React
 * @param {string} event
 * @param {object} data
 */
export function emit(event, data) {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
}

/**
 * Listens to an event
 * @param {string} event
 * @param {function} callback
 */
export function on(event, callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(event, handler);
  return handler;
}

/**
 * Removes an event listener
 * @param {string} event
 * @param {function} handler
 */
export function off(event, handler) {
  window.removeEventListener(event, handler);
}
