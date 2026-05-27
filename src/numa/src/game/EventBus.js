/**
 * Sends an event from Phaser to React
 * @param {string} event - event name
 * @param {object} data - payload
 */
export function emit(event, data) {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
}

/**
 * Listens to a Phaser event from React
 * @param {string} event - event name
 * @param {function} callback
 */
export function on(event, callback) {
  window.addEventListener(event, (e) => callback(e.detail));
}

/**
 * Removes a Phaser event listener
 * @param {string} event - event name
 * @param {function} callback
 */
export function off(event, callback) {
  window.removeEventListener(event, callback);
}
