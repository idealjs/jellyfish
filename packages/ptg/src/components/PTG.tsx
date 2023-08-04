import type P5 from "p5";
import { Vector } from "p5";
import React, { lazy, useCallback } from "react";

import { VoronoiCell, VoronoiDiagram } from "../utils/voronio";

const Sketch = lazy(() => import("react-p5"));

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
    const getCellType = (params: {
      height: number;
      width: number;
      x: number;
      y: number;
      scale: number;
      seed: number;
    }) => {
      const { width, height, x, y, scale, seed } = params;
      p5.noiseSeed(seed);
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

    const getSharedEdge = (
      p5: any,
      cell1: VoronoiCell,
      cell2: VoronoiCell
    ): Vector[] | null => {
      // Convert polygon vertices to string representation for comparison
      const cell1Edges = cell1.polygon.map((v) => `${v.x},${v.y}`);
      const cell2Edges = cell2.polygon.map((v) => `${v.x},${v.y}`);

      // Find common edges
      const sharedEdges = cell1Edges.filter((edge) =>
        cell2Edges.includes(edge)
      );

      // If there are exactly two shared edges, return them as Vectors
      if (sharedEdges.length > 0) {
        return sharedEdges.map((edge) => {
          const [x, y] = edge.split(",").map(Number);
          return p5.createVector(x, y);
        });
      }

      // If there are not exactly two shared edges, return null
      return null;
    };

    const points: Vector[] = [];
    for (let i = 0; i < 10; i++) {
      points.push(
        p5.createVector(Math.random() * width, Math.random() * height)
      );
    }

    const voronoi = new VoronoiDiagram(p5, points, 5, width, height);
    voronoi.cells.forEach((cell) => {
      let centroid = {
        x: cell.site.x,
        y: cell.site.y,
      };

      // Decide whether or not to color the cell
      if (
        getCellType({
          width,
          height,
          x: centroid.x,
          y: centroid.y,
          scale: 0.006,
          seed: 0,
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

    p5.fill(255, 0, 0); // Set the color of the circles (R,G,B)
    for (const cell of voronoi.cells) {
      p5.ellipse(cell.site.x, cell.site.y, 10, 10); // Draw a circle at the site position
    }

    // draw connections
    p5.stroke(255, 0, 0); // Set the color of the lines (R,G,B)
    for (const cell of voronoi.cells) {
      if (cell.neighbors) {
        for (const neighborIndex of cell.neighbors) {
          const neighbor = voronoi.cells[neighborIndex];
          p5.line(cell.site.x, cell.site.y, neighbor.site.x, neighbor.site.y);
        }
      }
    }

    for (let i = 0; i < voronoi.cells.length; i++) {
      let cell = voronoi.cells[i];
      if (cell.neighbors) {
        for (let j = 0; j < cell.neighbors.length; j++) {
          let neighborCell = voronoi.cells[cell.neighbors[j]];
          const sharedEdge = getSharedEdge(p5, cell, neighborCell);
          const isDifferentType =
            getCellType({
              width,
              height,
              x: cell.site.x,
              y: cell.site.y,
              scale: 0.006,
              seed: 0,
            }) !==
            getCellType({
              width,
              height,
              x: neighborCell.site.x,
              y: neighborCell.site.y,
              scale: 0.006,
              seed: 0,
            });

          if (sharedEdge && isDifferentType) {
            p5.strokeWeight(3); // Set stroke weight to 2 pixels
            p5.stroke(0, 0, 255); // Set stroke color to red for shared edges
            p5.line(
              sharedEdge[0].x,
              sharedEdge[0].y,
              sharedEdge[1].x,
              sharedEdge[1].y
            );
          }
        }
      }
    }
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
