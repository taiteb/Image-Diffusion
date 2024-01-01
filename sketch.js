// In this sketch I want to combine two previous projects:
// I want to use the image processing elements of my ASCII project
// to seed a reaction diffusion gradient. I'll have to scale back
// the number of options outputted from the ASCII processing
// to a simple binary; if the image is light, give it A, if it's
// dark, give it B. 

// arrays of pixels for reaction diffusion
let grid = [];
let next = [];

// image processing terms
let img
let wid
let hig 

// sets threshold at which it will fill an area with B
let binaryThreshold = 0.415
// sets level of B added to items which meet threshold
let bLevel = 0.415

// Terms used for Laplace process for A and B
let dA = 1;
let dB = .5;
let feed = .055;
let k = 0.062;

let counter

function preload() {
  img = loadImage('/kirby.png')
  // pixelDensity(1)
}

function setup() {
  img.resize(900, 0)
  wid = img.width
  hig = img.height
  createCanvas(wid, hig)
  pixelDensity(1)

  counter = createElement('p')

  img.loadPixels();
  for (let i = 0; i < height; i++) {
    grid[i] = []
    next[i] = []
    for (let j = 0; j < width; j++) {
      // p5 uses a 1d array for images, stored RGBA
      // index location for the pixel we're observing is our current location
      // on the row, plus however many rows we're down (times number of pixels in that row)
      // multiplied by 4 (4 data points [RGBA] for each pixel)
      let index = (j + i * wid)*4
      r = img.pixels[index]
      g = img.pixels[index + 1]
      b = img.pixels[index + 2]

      // seeds initial grid and starting next grid with A/B values based on input image
      grid[i][j] = rgbAvgToBinary(r, g, b)
      next[i][j] = rgbAvgToBinary(r, g, b)
    }
  }
}

function draw() {
  background(255);

  for (let y = 1; y < height-1; y++) {
    for (let x = 1; x < width-1; x++) {
      let a = grid[y][x].a
      let b = grid[y][x].b
      next[y][x].a = a + (dA * laplaceA(y, x)) - (a * b * b) + (feed * (1-a));
      next[y][x].b = b + (dB * laplaceB(y, x)) + (a * b * b) - ((k + feed) * b);
    }
  }
  loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pix = (x + y * width) * 4;
      pixels[pix + 0] = grid[y][x].a*255;
      pixels[pix + 0] = 0;
      pixels[pix + 1] = grid[y][x].a*255;
      // pixels[pix + 1] = 0;
      pixels[pix + 2] = grid[y][x].b*255;
      if (grid[y][x].a > grid[y][x].b * 2){
        pixels[pix + 3] = 0;
      } else {
        pixels[pix + 3] = 255;
      }
      
    }
  }
  updatePixels();
  // filter(THRESHOLD)

  swap();

  counter.html(frameCount)

  if ( frameCount == 100 || frameCount % 500 == 0) {
    saveCanvas(`RD${frameCount}.png`)
  }
  
  
}

function swap() {
  var temp = grid;
  grid = next;
  next = temp;
}

function laplaceA(y, x){
  let sumA = 0;
  sumA += grid[y][x].a * -1;
  sumA += grid[y-1][x].a * 0.2;
  sumA += grid[y+1][x].a * 0.2;
  sumA += grid[y][x-1].a * 0.2;
  sumA += grid[y][x+1].a * 0.2;
  sumA += grid[y-1][x-1].a * 0.05;
  sumA += grid[y+1][x-1].a * 0.05;
  sumA += grid[y+1][x+1].a * 0.05;
  sumA += grid[y-1][x+1].a * 0.05;

  return sumA;
}

function laplaceB(y, x){
  let sumB = 0;
  sumB += grid[y][x].b * -1;
  sumB += grid[y-1][x].b * 0.2;
  sumB += grid[y+1][x].b * 0.2;
  sumB += grid[y][x-1].b * 0.2;
  sumB += grid[y][x+1].b * 0.2;
  sumB += grid[y-1][x-1].b * 0.05;
  sumB += grid[y+1][x-1].b * 0.05;
  sumB += grid[y+1][x+1].b * 0.05;
  sumB += grid[y-1][x+1].b * 0.05;

  return sumB;
}

// processes relative rgb values, outputs seed for RD based on lightness/darkness
function rgbAvgToBinary(r, g, b) {
  let avg = (r * 0.2126 + g * 0.7152 + b * 0.0722)/255
  if (avg < binaryThreshold ) {
    return { a: 1, b: bLevel }
  } else {
    return { a: 1, b: 0 }
  }
}