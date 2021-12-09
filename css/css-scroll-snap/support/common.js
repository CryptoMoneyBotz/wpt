const KEY_CODE_MAP = {
  'ArrowLeft':  '\uE012',
  'ArrowUp':    '\uE013',
  'ArrowRight': '\uE014',
  'ArrowDown':  '\uE015',
  'PageUp':     '\uE00E',
  'PageDown':   '\uE00F',
  'End':        '\uE010',
  'Home':       '\uE011',
  'Space':      ' ',
};

// Send key event to the target element using test driver. Supports human
// friendly key names for common keyboard scroll operations e.g., arrow keys,
// page keys, etc.
async function keyPress(target, key) {
  let code = key;
  if (KEY_CODE_MAP.hasOwnProperty(key))
    code = KEY_CODE_MAP[key];

  // First move pointer on target and click to ensure it receives the key.
  return test_driver.send_keys(target, code);
}

// Use rAF to wait for the value of the getter function passed to not change for
// at least 15 frames or timeout after 1 second.
//
// Example usage:
//    await waitForAnimationEnd(() => scroller.scrollTop);
function waitForAnimationEnd(getValue) {
  const TIMEOUT = 1000; // milliseconds
  const MAX_UNCHANGED_FRAMES = 15;

  const start_time = performance.now();
  let last_changed_frame = 0;
  let last_value = getValue();

  return new Promise((resolve, reject) => {
    function tick(frames, time) {
    // We requestAnimationFrame either for TIMEOUT milliseconds or until
    // MAX_UNCHANGED_FRAMES with no change have been observed.
      if (time - start_time > TIMEOUT ||
          frames - last_changed_frame >= MAX_UNCHANGED_FRAMES) {
        resolve();
      } else {
        current_value = getValue();
        if (last_value != current_value) {
          last_changed_frame = frames;
          last_value = current_value;
        }
        requestAnimationFrame(tick.bind(this, frames + 1));
      }
    }
    tick(0, start_time);
  });
}

function waitForEvent(eventTarget, type) {
  return new Promise((resolve, reject) => {
    const eventListener = () => {
      eventTarget.removeEventListener(type, eventListener);
      resolve();
    };
    eventTarget.addEventListener(type, eventListener);
  });
}

function waitForScrollEvent(eventTarget) {
  return waitForEvent(eventTarget, 'scroll');
}

function waitForWheelEvent(eventTarget) {
  return waitForEvent(eventTarget, 'wheel');
}

function waitForScrollEnd(eventTarget, getValue, targetValue) {
  return new Promise((resolve, reject) => {
    const scrollListener = () => {
      if (getValue() == targetValue) {
        eventTarget.removeEventListener('scroll', scrollListener);
        resolve();
      }
    };
    if (getValue() == targetValue)
      resolve();
    else
      eventTarget.addEventListener('scroll', scrollListener);
  });
}

function waitFor(condition) {
  const TIMEOUT = 1000; // milliseconds
  const start_time = performance.now();
  return new Promise((resolve, reject) => {
    const callback = function(time) {
      if (condition() || time - start_time > TIMEOUT)
        resolve();
      else
        requestAnimationFrame(callback);
    }
    callback(start_time);
  });
}

