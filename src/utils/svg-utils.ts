class SvgUtils {
  static getRootBoundingBox(element: any, rootId?: string) {
    const transform = {
      x: 0,
      y: 0
    };
    let current = element;
    while ((rootId && current.id !== rootId) || (!rootId && current.nodeName !== 'svg')) {
      if (current.transform.baseVal.length > 0) {
        const matrix = current.transform.baseVal[0].matrix;
        transform.x += matrix.e;
        transform.y += matrix.f;
      }
      current = current.parentNode;
    }
    const bBox = element.getBBox();
    return {
      height: bBox.height,
      width: bBox.width,
      x: transform.x + bBox.x,
      y: transform.y + bBox.y
    };
  }
}
