let myFont;
let inputName;
let inputTitle;
let inputImage;
let inputURL;

let previewButton;
let saveButton;
let pg;
let p5Img, previewImg;
let qrImage;
let qrcode;
let qrDiv;
//A4 pix size 2894 x 

function preload() {
    myFont = loadFont('assets/Inconsolata-Regular.ttf');
}

function setup() {
    createCanvas(2894, 3507);
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

    qrDiv = new QRCode(document.getElementById("qrcode"), {
        width: 100,
        height: 100
    });


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
    if (qrImage) {
        image(qrImage, 20, 300, 289, 409);
    }
}

function preview() {
    let name = inputName.value();
    let title = inputTitle.value();

    if (inputURL != null) {
        qrDiv.makeCode(inputURL.value());

        const qrCodeContainer = document.getElementById('qrcode');
        const qrChildren = qrCodeContainer.children;
        const qrCodeImage = qrChildren[1];
        const base64 = qrCodeImage.getAttribute('src');
        console.log(qrChildren);
        console.log(qrCodeImage);
        console.log(base64);

        //--------new----------------
        // const qrDivChild = qrDiv.children;
        // console.log(qrDiv);
        // console.log(qrDiv._oDrawing._elImage.src);
        //qrImage = loadImage(qrDiv._oDrawing._elImage);

        //console.log(qrChildren[1].toDataURL("image/png"));

        //const src = qrDiv.children['src'].toDataURL("image/png");
        //console.info('src', src);
        //console.log(qrDiv.children[1].toDataURL("image/png"));
    }

    if (p5Img) {
        pg = createGraphics(2480, 3507); //A4 size(2894 x 3507)
        pg.background(255);
        pg.imageMode(CENTER);
        pg.image(p5Img, pg.width / 2, pg.height / 2); //center position
        stroke(0);
        pg.textSize(100);
        pg.textFont(myFont);
        pg.text(title, 150, 3200);
        pg.text(name, 150, 3360);

        previewImg = pg;
    }
}

function handleFile(file) {
    print(file);
    if (file.type === 'image') {
        p5Img = createImg(file.data, '');
        p5Img.hide();
    } else {
        p5Img = null;
    }
}

function exportImage() {
    save('myCanvas', 'svg');
}