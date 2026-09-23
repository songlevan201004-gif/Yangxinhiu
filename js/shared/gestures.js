export function attachGestures(surface, { onDrag, onPinch, onRelease } = {}) {
  const pointers = new Map();
  let previousDistance = 0;

  const blockedTarget = (target) => target instanceof Element && Boolean(target.closest("button, a, input, textarea, select, [role='button']"));

  function pointerDown(event) {
    if (blockedTarget(event.target)) return;
    event.preventDefault();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    surface.setPointerCapture?.(event.pointerId);
    if (pointers.size === 2) previousDistance = getDistance();
  }

  function pointerMove(event) {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const previous = pointers.get(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      onDrag?.(event.clientX - previous.x, event.clientY - previous.y);
      return;
    }

    if (pointers.size === 2) {
      const distance = getDistance();
      if (previousDistance) onPinch?.(distance - previousDistance);
      previousDistance = distance;
    }
  }

  function pointerUp(event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    previousDistance = pointers.size === 2 ? getDistance() : 0;
    onRelease?.();
  }

  function getDistance() {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return 0;
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  surface.addEventListener("pointerdown", pointerDown, { passive: false });
  surface.addEventListener("pointermove", pointerMove, { passive: false });
  surface.addEventListener("pointerup", pointerUp);
  surface.addEventListener("pointercancel", pointerUp);

  return () => {
    surface.removeEventListener("pointerdown", pointerDown);
    surface.removeEventListener("pointermove", pointerMove);
    surface.removeEventListener("pointerup", pointerUp);
    surface.removeEventListener("pointercancel", pointerUp);
    pointers.clear();
  };
}
