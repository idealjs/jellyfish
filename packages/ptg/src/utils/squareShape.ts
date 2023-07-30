const squareShape = (params: {
  width: number;
  height: number;
  x: number;
  y: number;
}) => {
  const { width, height, x, y } = params;
  const x1 = 0.25 * width;
  const x2 = 0.75 * width;
  const y1 = 0.25 * height;
  const y2 = 0.75 * height;
  return (
    (x1 < x && x < x2 && y1 < y && y < y2) ||
    (x1 < x && x < x2 && y1 < y + height && y + height < y2) ||
    (x1 < x && x < x2 && y1 < y - height && y - height < y2) ||
    (x1 < x + width && x + width < x2 && y1 < y && y < y2) ||
    (x1 < x - width && x - width < x2 && y1 < y && y < y2)
  );
};

export default squareShape;
