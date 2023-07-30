const sphereShape = (params: {
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
  const r = 0.35 * width;
  return (
    Math.pow(x - (x1 + x2) / 2, 2) + Math.pow(y - (y1 + y2) / 2, 2) <
    Math.pow(r, 2)
  );
};

export default sphereShape;
