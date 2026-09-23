export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function setStyles(element, values) {
  Object.entries(values).forEach(([key, value]) => element.style.setProperty(key, value));
  return element;
}

export function svgIcon(name) {
  const paths = {
    sound: '<path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zm0-8.5v2.1a8 8 0 0 1 0 12.8v2.1a10 10 0 0 0 0-17z"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.2-2.2-1.4-1.4-2.2 2.2L13 8.4 11.6 9.8l2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4z"/>',
    heart: '<path d="M12 21s-7-4.4-9.4-8.5C.5 8.8 2.3 5 6.2 5c2.2 0 3.7 1.3 4.6 2.5C11.7 6.3 13.2 5 15.4 5c3.9 0 5.7 3.8 3.6 7.5C16.7 16.6 12 21 12 21z"/>',
    letter: '<path d="M3 5h18v14H3V5zm2 2v.4l7 5.1 7-5.1V7H5zm14 10V9.9l-7 5-7-5V17h14z"/>',
    home: '<path d="m12 3-9 8h2v9h5v-6h4v6h5v-9h2l-9-8z"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.heart}</svg>`;
}

export function iconButton(name, label, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`.trim();
  button.setAttribute("aria-label", label);
  button.innerHTML = svgIcon(name);
  return button;
}
