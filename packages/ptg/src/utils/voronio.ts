import { Delaunay } from "d3-delaunay";
import type P5 from "p5";
import { Vector } from "p5";

export interface VoronoiCell {
  site: Vector;
  polygon: Vector[];
  neighbors?: number[];
}

export class VoronoiDiagram {
  cells: VoronoiCell[] = [];

  constructor(
    p5: P5,
    points: Vector[],
    iterations: number = 1,
    width: number,
    height: number
  ) {
    for (let iter = 0; iter < iterations; iter++) {
      const delaunay = Delaunay.from(points.map((p) => [p.x, p.y]));
      const voronoi = delaunay.voronoi([0, 0, width, height]);

      this.cells = points.map((point, index) => {
        const polygon = voronoi.cellPolygon(index);
        return {
          site: point,
          polygon: polygon
            ? polygon.map(([x, y]) => p5.createVector(x, y))
            : [],
          neighbors: Array.from(delaunay.neighbors(index)),
        };
      });

      // For all further iterations, move the points to the centroid of their cell
      if (iter < iterations - 1) {
        points = this.cells.map((cell) => this.centroid(p5, cell.polygon));
      }
    }
  }

  centroid(p5: P5, polygon: Vector[]): Vector {
    let x = 0;
    let y = 0;
    for (let point of polygon) {
      x += point.x;
      y += point.y;
    }
    return p5.createVector(x / polygon.length, y / polygon.length);
  }
}
