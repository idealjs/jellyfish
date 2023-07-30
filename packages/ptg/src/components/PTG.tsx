import type P5 from "p5";
import { Vector } from "p5";
import React, { useCallback } from "react";
import Sketch from "react-p5";

import { VoronoiDiagram } from "../utils/voronio";

const createSetup =
  (params: { height: number; width: number }) =>
  (p5: P5, canvasParentRef: Element) => {
    p5.createCanvas(params.width, params.height).parent(canvasParentRef);
    p5.noLoop();
  };

const createDraw =
  (params: {
    shape: (params: {
      width: number;
      height: number;
      x: number;
      y: number;
    }) => boolean;
    noiseSeed: number;
    width: number;
    height: number;
  }) =>
  (p5: P5) => {
    const { shape, noiseSeed, width, height } = params;
    const noiseShape = (params: {
      height: number;
      width: number;
      x: number;
      y: number;
      scale: number;
    }) => {
      const { width, height, x, y, scale } = params;
      // p5.noiseSeed(noiseSeed)
      const value = p5.noise(x * scale, y * scale);
      return value > 0.4 && shape({ width, height, x, y });
    };

    const createNoiseMap = (params: {
      scale: number;
      width: number;
      height: number;
    }) => {
      const { scale, width, height } = params;
      let img = p5.createImage(width, height);
      p5.noiseSeed(noiseSeed);
      img.loadPixels();
      for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
          let value = p5.noise(x * scale, y * scale);
          img.set(x, y, p5.color(value * 255, value * 255, value * 255, 255));
        }
      }
      img.updatePixels();
      return img;
    };

    const points: Vector[] = [];
    for (let i = 0; i < 1000; i++) {
      points.push(
        p5.createVector(Math.random() * width, Math.random() * height)
      );
    }

    const noiseMap = createNoiseMap({ scale: 0.005, width, height });

    const voronoi = new VoronoiDiagram(p5, points, 5, width, height);
    voronoi.cells.forEach((cell) => {
      let centroid = {
        x: cell.polygon.reduce((sum, v) => sum + v.x, 0) / cell.polygon.length,
        y: cell.polygon.reduce((sum, v) => sum + v.y, 0) / cell.polygon.length,
      };

      // Decide whether or not to color the cell
      if (
        noiseShape({
          width,
          height,
          x: centroid.x,
          y: centroid.y,
          scale: 0.006,
        })
      ) {
        p5.fill(177, 166, 148); // Color the cell green
      } else {
        p5.fill(54, 54, 94); // Color the cell white
      }
      p5.beginShape();
      cell.polygon.forEach((point) => {
        p5.vertex(point.x, point.y);
      });
      p5.endShape(p5.CLOSE);
    });
    // p5.image(noiseMap,0,0)
  };

interface IProps {
  height: number;
  width: number;
  noiseSeed: number;
  shape: (params: {
    width: number;
    height: number;
    x: number;
    y: number;
  }) => boolean;
}

const PTG = (props: IProps) => {
  const { height, width, shape, noiseSeed } = props;
  const setup = useCallback(
    (p5: P5, canvasParentRef: Element) => {
      return createSetup({ height, width })(p5, canvasParentRef);
    },
    [height, width]
  );

  const draw = useCallback(
    (p5: P5) => {
      return createDraw({
        shape,
        width,
        height,
        noiseSeed,
      })(p5);
    },
    [height, noiseSeed, shape, width]
  );

  return (
    <div>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default PTG;
