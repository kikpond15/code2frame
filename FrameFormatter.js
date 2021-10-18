let myFont;
let inputName;
let inputTitle;
let inputImage;
let inputURL;

let img, previewImg;
let previewButton;
let saveButton;
let pg;
let tagDiv;

//A4 pix size 2894 x 4093

function preload() {
  myFont = loadFont('assets/Inconsolata-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, 800);
  textFont(myFont);
  textSize(20);

  inputName = createInput();
  inputName.position(20, 60);

  inputTitle = createInput();
  inputTitle.position(20, 120);

  inputImage = createFileInput(handleFile);
  inputImage.position(20, 175);

  inputURL = createInput('');
  inputURL.position(20, 235);

  previewButton = createButton('preview');
  previewButton.position(20, 270);
  previewButton.mousePressed(preview);

  saveButton = createButton('export');
  saveButton.position(100, 270);
  saveButton.mousePressed(exportImage);

  imageMode(LEFT);
}

function draw() {
  background(180);
  text('creater name', 20, 50);
  text('title', 20, 110);
  text('inport image', 20, 170);
  text('code site url(openProcessing/p5 editor/GitHub)', 20, 230);

  if (previewImg) {
    image(previewImg, 20, 300, 289, 409);
  }
}

function preview() {
  let name = inputName.value();
  let title = inputTitle.value();
  if (img) {
    pg = createGraphics(2480, 3507); //A4 size(2894 x 4093)
    pg.background(255);
    pg.imageMode(CENTER);
    pg.image(img, pg.width/2, pg.height/2); //center position
    stroke(0);
    pg.textSize(100);
    pg.textFont(myFont);
    pg.text(title, 150, 3200);
    pg.text(name, 150, 3360);

    if (inputURL != null) {
      let qr = qrcode(0, 'L');
      qr.addData(inputURL.value());
      qr.make();
      let qrImg = qr.createImgTag(5, 20, "qr code");
      tagDiv = createDiv();
      tagDiv.position(350, 300);
      tagDiv.html(qrImg);
      
      //pg.image(, 2500,3200);
    }

    previewImg = pg;
  }
}

function handleFile(file) {
  print(file);
  if (file.type === 'image') {
    img = createImg(file.data, '');
    img.hide();
  } else {
    img = null;
  }
}

function exportImage() {
  save(pg, 'myCanvas.jpg');
}
