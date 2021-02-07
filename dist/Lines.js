import React from 'react';
import './Lines.css';
const clearWater = '#c3e5ec';
const Directions = {
  TOP: 0,
  TOP_RIGHT: 1,
  TOP_LEFT: 2,
  BOTTOM_RIGHT: 3,
  BOTTOM_LEFT: 4,
  BOTTOM: 5,
  RIGHT: 6,
  LEFT: 7
};
export class Background extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      els: []
    };
    this.DIST = 50;
    this.width = 0;
    this.backgroundInterval = 0;
  }

  componentDidMount() {
    this._drawBackground();

    const debounce = func => {
      let timer;
      return function (event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 100, event);
      };
    };

    window.addEventListener('resize', debounce(() => {
      if (this.width > 768 || this.width !== window.innerWidth) {
        this._drawBackground();
      }
    }));
  }

  render() {
    return /*#__PURE__*/React.createElement("svg", {
      height: "100vh",
      width: "100vw",
      className: "svg-background"
    }, this.state.els);
  }

  _setWidth() {
    this.width = window.innerWidth;
  }

  _drawBackground() {
    clearInterval(this.backgroundInterval);

    this._setWidth();

    this.setState({
      els: []
    });

    const linesGenerator = this._getNewLines();

    this.backgroundInterval = setInterval(() => {
      const nextLines = linesGenerator.next().value;

      if (!nextLines) {
        clearInterval(this.backgroundInterval);
        return;
      }

      this.setState({
        els: [...this.state.els, ...nextLines]
      });
    }, 100);
  }

  *_getNewLines() {
    const points = this._getSeedPoints();

    const visited = new Set();

    while (points.length > 0) {
      const lines = [];
      const currPointsCount = points.length;

      for (let i = 0; i < currPointsCount; i++) {
        const point = points.shift();

        if (visited.has(this._getPointKey(point))) {
          continue;
        }

        visited.add(this._getPointKey(point));

        if (point && this._isPointValid(point)) {
          const neighbors = this._getRandomNeighbors(point).filter(neighbor => !visited.has(this._getPointKey(neighbor)));

          lines.push(...neighbors.map(neighbor => this._createLine(point, neighbor)));
          points.push(...neighbors);
        }
      }

      yield lines;
    }
  }

  _createLine(from, to) {
    return /*#__PURE__*/React.createElement("line", {
      key: `s${this._getPointKey(from)}e${this._getPointKey(to)}`,
      className: "back-line",
      x1: `${from.x}px`,
      y1: `${from.y}px`,
      x2: `${to.x}px`,
      y2: `${to.y}px`,
      stroke: clearWater,
      strokeLinecap: "round",
      strokeWidth: "5px"
    });
  }

  _isPointValid(point) {
    const {
      innerHeight,
      innerWidth
    } = window;
    return !(point.x < 0 || point.y < 0 || point.x > innerWidth || point.y > innerHeight);
  }

  _getPointKey(point) {
    return `${point?.x},${point?.y}`;
  }

  _getRandomNeighbors(point) {
    const directions = this._getRandomDirections(point.parent);

    return directions.map(direction => {
      switch (direction) {
        case Directions.TOP:
          return {
            x: point.x,
            y: point.y - Background.DIST,
            parent: Directions.BOTTOM
          };

        case Directions.TOP_LEFT:
          return {
            x: point.x - Background.DIST,
            y: point.y - Background.DIST,
            parent: Directions.BOTTOM_RIGHT
          };

        case Directions.TOP_RIGHT:
          return {
            x: point.x + Background.DIST,
            y: point.y - Background.DIST,
            parent: Directions.BOTTOM_LEFT
          };

        case Directions.BOTTOM:
          return {
            x: point.x,
            y: point.y + Background.DIST,
            parent: Directions.TOP
          };

        case Directions.BOTTOM_LEFT:
          return {
            x: point.x - Background.DIST,
            y: point.y + Background.DIST,
            parent: Directions.TOP_RIGHT
          };

        case Directions.BOTTOM_RIGHT:
          return {
            x: point.x + Background.DIST,
            y: point.y + Background.DIST,
            parent: Directions.TOP_LEFT
          };

        case Directions.LEFT:
          return {
            x: point.x - Background.DIST,
            y: point.y,
            parent: Directions.TOP_LEFT
          };

        case Directions.RIGHT:
          return {
            x: point.x + Background.DIST,
            y: point.y,
            parent: Directions.TOP_LEFT
          };

        default:
          return {
            x: point.x,
            y: point.y
          };
      }
    });
  }

  _getRandomDirections(incoming) {
    const array = [Directions.TOP, Directions.TOP_RIGHT, Directions.TOP_LEFT, Directions.BOTTOM, Directions.BOTTOM_LEFT, Directions.BOTTOM_RIGHT, Directions.LEFT, Directions.RIGHT].filter(direction => direction !== incoming);

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.slice(incoming ? 4 : 5);
  }

  _getSeedPoints() {
    const {
      innerHeight,
      innerWidth
    } = window;
    const startingPoints = [];

    for (let x = 100; x < innerWidth; x += 500) {
      for (let y = 100; y < innerHeight; y += 500) {
        startingPoints.push({
          x,
          y
        });
      }
    }

    return startingPoints;
  }

}
;