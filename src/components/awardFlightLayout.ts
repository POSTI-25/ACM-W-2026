/** Read layout coordinates independently of the scroll reveal's scale/tilt. */
export function awardLocalRect(element: HTMLElement, stage: HTMLElement) {
  let left = 0, top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== stage) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top, right: left + element.offsetWidth, bottom: top + element.offsetHeight,
    width: element.offsetWidth, height: element.offsetHeight };
}
