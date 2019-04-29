
const PARAMS = Object.freeze({
  MAP_ROWS: 6,
  MAP_COLS: 5,
  OFFSET_X: 350,
  OFFSET_Y: 30,
  TILE_WIDTH: 140,
  ASPECT: 150/108,
  GRID_COLOR: 0xcccccc,
  HOVER_COLOR: 0xcccc00,
  SELECT_COLOR: 0xdd3333
});

const TILE_TYPES = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD'
};

// NB: size adjustment values are additive, derive from TILE_WIDTH
const sprites = {
  bush:         { assetURL: 'assets/bush.png', type: TILE_TYPES.ALIVE, dW: -PARAMS.TILE_WIDTH*0.1 },
  coffin:       { assetURL: 'assets/coffin.png', type: TILE_TYPES.DEAD },
  crypt:        { assetURL: 'assets/crypt.png', type: TILE_TYPES.DEAD },
  death:        { assetURL: 'assets/death.png' },
  debris:       { assetURL: 'assets/debris.png', type: TILE_TYPES.DEAD },
  empty:        { assetURL: 'assets/empty.png', type: TILE_TYPES.ALIVE },
  gravestone_1: { assetURL: 'assets/gravestone_1.png', type: TILE_TYPES.DEAD },
  gravestone_2: { assetURL: 'assets/gravestone_2.png', type: TILE_TYPES.DEAD },
  gravestone_3: { assetURL: 'assets/gravestone_3.png', type: TILE_TYPES.DEAD },
  gravestone_4: { assetURL: 'assets/gravestone_4.png', type: TILE_TYPES.DEAD },
  ground:       { assetURL: 'assets/ground.png' },
  house_1:      { assetURL: 'assets/house_1.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.15 },
  house_2:      { assetURL: 'assets/house_2.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.15 },
  house_3:      { assetURL: 'assets/house_3.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.15 },
  house_4:      { assetURL: 'assets/house_4.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.45 },
  house_5:      { assetURL: 'assets/house_5.png', type: TILE_TYPES.ALIVE, dW: -PARAMS.TILE_WIDTH*0.15, dX: PARAMS.TILE_WIDTH*0.1 },
  icon_check:   { assetURL: 'assets/icon_check.png' },
  icon_people:  { assetURL: 'assets/icon_people.png' },
  icon_skull:   { assetURL: 'assets/icon_skull.png' },
  rocks_1:      { assetURL: 'assets/rocks_1.png', type: TILE_TYPES.ALIVE, dW: -PARAMS.TILE_WIDTH*0.1, dH: -PARAMS.TILE_WIDTH*0.1 },
  rocks_2:      { assetURL: 'assets/rocks_2.png', type: TILE_TYPES.ALIVE, dW: -PARAMS.TILE_WIDTH*0.1 },
  tree_1:       { assetURL: 'assets/tree_1.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.2 },
  tree_2:       { assetURL: 'assets/tree_2.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.2 },
  tree_3:       { assetURL: 'assets/tree_3.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.2 },
  tree_4:       { assetURL: 'assets/tree_4.png', type: TILE_TYPES.ALIVE, dH: PARAMS.TILE_WIDTH*0.2 },
  trunk_1:      { assetURL: 'assets/trunk_1.png' },
  trunk_2:      { assetURL: 'assets/trunk_2.png' }
}

const app = new PIXI.Application({
  antialias: true
});
console.log('app:',app);
document.body.appendChild(app.view);
app.stage.buttonMode = true;
app.stage.interactive = true;
app.stage.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
app.stage.cursor = 'url(assets/cursor.png) 5 5, auto';﻿
const gridlines = new PIXI.Graphics();
const loader = PIXI.loader;

for (let key in sprites) {
  const sprite = sprites[key];
  loader.add(key, sprite.assetURL);
}

const map = {};
const objects = {};
(function initMap() {
  const aliveObjectNames = Object.keys(sprites).filter(key => sprites[key].type === TILE_TYPES.ALIVE);
  for (let i=0; i<PARAMS.MAP_ROWS; i++) {
    const mapRow = {};
    const objectsRow = {};
    for (let j=0; j<PARAMS.MAP_COLS; j++) {
      //row[j] = ['ground', 'ground_2', 'ground_3'][(i+j)%3];
      mapRow[j] = 'ground';
      objectsRow[j] = [
        getRandomItem(aliveObjectNames),
        getRandomItem(aliveObjectNames),
        getRandomItem(aliveObjectNames),
        getRandomItem(aliveObjectNames)
      ];
    }
    map[i] = mapRow;
    objects[i] = objectsRow;
  }
  console.log('maps initialized:', map, objects);
})();

(function drawGrid() {
  gridlines.lineStyle(1.5, PARAMS.GRID_COLOR);
  const x0 = PARAMS.OFFSET_X;
  const y0 = PARAMS.OFFSET_Y;
  const tileW = PARAMS.TILE_WIDTH;
  const tileH = PARAMS.TILE_WIDTH/PARAMS.ASPECT;
  for (let i = 0;i<PARAMS.MAP_ROWS+1; i++) {
    gridlines.moveTo(
      x0 + 0.5*tileW - i*tileW/2,
      y0 + i*tileH/2
    );
    gridlines.lineTo(
      x0 + 0.5*tileW + PARAMS.MAP_COLS * tileW/2  - i*tileW/2,
      y0 + PARAMS.MAP_COLS * tileH/2 + i*tileH/2
    );
  }
  for (let j = 0;j<PARAMS.MAP_COLS+1; j++) {
    gridlines.moveTo(
      x0 + 0.5*tileW + j*tileW/2,
      y0 + j*tileH/2
    );
    gridlines.lineTo(
      x0 + 0.5*tileW - PARAMS.MAP_ROWS * tileW/2 + j*tileW/2,
      y0 + PARAMS.MAP_ROWS * tileH/2 + j*tileH/2
    );
  }
})();

let mouseX = 0;
let mouseY = 0;

loader.load((loader, resources) => {
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const tileW = PARAMS.TILE_WIDTH;
  const tileH = tileW/PARAMS.ASPECT;

  // draw tile map
  for (let i=0; i<PARAMS.MAP_ROWS; i++) {
    for (let j=0; j<PARAMS.MAP_COLS; j++) {
      const currentTileKey = map[i][j];
      const currentTile = sprites[currentTileKey];
      const ground = new PIXI.Sprite(resources[currentTileKey].texture);
      ground.width = tileW + (currentTile.dW | 0);
      ground.height = tileH + (currentTile.dH | 0);
      ground.x = PARAMS.OFFSET_X - i*tileW/2 + j*tileW/2 + (currentTile.dX | 0);
      ground.y = PARAMS.OFFSET_Y + i*tileH/2 + j*tileH/2 + (currentTile.dY | 0);      
      app.stage.addChild(ground);
    }
  }
  
  app.stage.addChild(gridlines);

  const x0 = PARAMS.OFFSET_X;
  const y0 = PARAMS.OFFSET_Y;
  
  const hoverMarker = new PIXI.Graphics();
  hoverMarker.moveTo(x0+tileW/2, y0);
  hoverMarker.lineStyle(4, PARAMS.HOVER_COLOR);  
  hoverMarker.lineTo(x0+tileW, y0+tileH/2);
  hoverMarker.lineTo(x0+tileW/2, y0+tileH);
  hoverMarker.lineTo(x0, y0+tileH/2);
  hoverMarker.lineTo(x0+tileW/2, y0);
  
  const selectionMarker = new PIXI.Graphics();
  selectionMarker.moveTo(x0+tileW/2, y0);
  selectionMarker.lineStyle(4, PARAMS.SELECT_COLOR);  
  selectionMarker.lineTo(x0+tileW, y0+tileH/2);
  selectionMarker.lineTo(x0+tileW/2, y0+tileH);
  selectionMarker.lineTo(x0, y0+tileH/2);
  selectionMarker.lineTo(x0+tileW/2, y0);

  app.stage.addChild(hoverMarker);
  app.stage.addChild(selectionMarker);

  // draw objects on map
  for (let i=0; i<PARAMS.MAP_ROWS; i++) {
    for (let j=0; j<PARAMS.MAP_COLS; j++) {
      const tileBaseX = PARAMS.OFFSET_X - i*tileW/2 + j*tileW/2;
      const tileBaseY = PARAMS.OFFSET_Y + i*tileH/2 + j*tileH/2; 
      const currentTileObjects = objects[i][j];
      currentTileObjects.forEach(function(objKey, index) {
        const currentObj = sprites[objKey];
        const objW = tileW / 3;
        const objH = objW/PARAMS.ASPECT;
        const objSprite = new PIXI.Sprite(resources[objKey].texture);
        objSprite.width = objW + (currentObj.dW | 0);
        objSprite.height = objH + (currentObj.dH | 0);
        const positions = {
          0: { x: objW,        y: objW*0.2 },
          1: { x: objW*0.3,    y: objW*0.65 },
          2: { x: objW*1.7,    y: objW*0.65 },
          3: { x: objW,        y: objW*1.1 }
        }
        objSprite.x = tileBaseX + positions[index].x + (currentObj.dX | 0);
        objSprite.y = tileBaseY + positions[index].y + (currentObj.dY | 0) - (currentObj.dH | 0);
        app.stage.addChild(objSprite);
      });
    }
  }
 
  app.ticker.add(() => {
    const hoveredTile = getTileFromCoords(mouseX, mouseY);
    if (hoveredTile) {
      const tileX = - hoveredTile.row*tileW/2 + hoveredTile.col*tileW/2;
      const tileY = hoveredTile.row*tileH/2 + hoveredTile.col*tileH/2;
      hoverMarker.x = tileX;
      hoverMarker.y = tileY;
    }
  });
  
  document.addEventListener('click', function(e) {
    const clickedTile = getTileFromCoords(e.clientX, e.clientY);
    if (clickedTile) {
      const tileX = - clickedTile.row*tileW/2 + clickedTile.col*tileW/2;
      const tileY = clickedTile.row*tileH/2 + clickedTile.col*tileH/2;
      selectionMarker.x = tileX;
      selectionMarker.y = tileY;
      selectionMarker.visible = true;
    } else {
      selectionMarker.visible = false;
    }
  });
});

function getTileFromCoords(clientX, clientY) {
  // We calculate the hit tile directly from the coordinates, returning undefined if no tile is hit.
  // This is done by translating (x,y) into the isometric coordinate system (projecting to the axes),
  // then using simple division by the known tile sizes to get the row and column values directly.
  
  // To follow the logic of this function, consider the triangle ABC where A is (offsetX, offsetY), B is (x, y),
  // and C is the sought projection of B onto the isometric axis (for simplicity, in the clientX < offsetX case):
  // - The isometric axis tilt alpha is known from the tile sizing params
  // - AB distance is known
  // - Angle CAB can be calculated by projecting B onto the horizontal line of A and forming the right triangle ABB'
  // - Note that angle BCA is 2*alpha (bisect with a horizontal line to see)
  // - With CAB, BCA and AB known, the law of sines yields the missing sides of the ABC triangle.
  // (Where AC is the sought projection to the left axis and CB is the projection to the right axis.)
  const x = clientX - PARAMS.OFFSET_X - PARAMS.TILE_WIDTH/2;
  const y = clientY - PARAMS.OFFSET_Y;  
  const tileW = PARAMS.TILE_WIDTH;
  const tileH = PARAMS.TILE_WIDTH/PARAMS.ASPECT;
  const tileEdge = Math.sqrt((tileW/2)*(tileW/2)+(tileH/2)*(tileH/2));
  const axisTilt = Math.asin((tileH/2)/tileEdge);
  const AB = Math.sqrt(x*x+y*y);
  const ABangleFromHorizontal = Math.asin(y/AB);
  
  if (ABangleFromHorizontal < axisTilt) return; // surely no hovered tile

  const CAB = ABangleFromHorizontal - axisTilt;
  const BCA = 2*axisTilt;
  const ABC = Math.PI - CAB - BCA;
  
  // applying the law of sines to ABC:
  let projectionY = AB / Math.sin(BCA) * Math.sin(ABC);
  let projectionX = AB / Math.sin(BCA) * Math.sin(CAB);
  
  // Until this point, we assumed that clientX < offsetX, but if it was not the case, the math results in switched numbers
  if (x >= 0) [projectionY, projectionX] = [projectionX, projectionY];
  
  const hoveredRow = Math.floor(projectionY/tileEdge);
  const hoveredCol = Math.floor(projectionX/tileEdge);
  
  // clamp to actual grid size:
  if (hoveredRow >= PARAMS.MAP_ROWS) return;
  if (hoveredCol >= PARAMS.MAP_COLS) return;
  
  return {
    row: hoveredRow,
    col: hoveredCol
  };
}

function getRandomItem(array) {
  return array[Math.floor(Math.random()*array.length)]; 
}