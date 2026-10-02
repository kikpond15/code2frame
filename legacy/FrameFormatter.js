let myFont;
let inputName, inputTitle, inputImage, inputURL;
let previewButton, saveButton;
let scaleSlider;
let isPortrait, isLandscape;

let p5Img, previewImg;
let qrImage, qrDiv, qrSample;
let cnv;
let createrName, title;
let isExport;
let portColor, landColor;

const rectSize = 25;

function preload() {
    qrSample = loadImage('img/QR.png');
}


function setup() {
    cnv = createCanvas(2480, 3508);
    //textFont(myFont);
    textFont('Georgia');
    textSize(100);
    isExport = false;
    isPortrait = true;
    isLandscape = false;

    let div = createDiv('Code2Frame');
    div.style('font-size', '30px');
    div.position(20, 0);

    let divName = createDiv('name');
    divName.style('font-size', '16px');
    divName.position(20, 50);

    inputName = createInput('no name');
    inputName.position(100, 50);

    let divTitle = createDiv('title');
    divTitle.style('font-size', '16px');
    divTitle.position(20, 80);

    inputTitle = createInput('no title');
    inputTitle.position(100, 80);

    let divURL = createDiv('site url');
    divURL.style('font-size', '16px');
    divURL.position(20, 110);

    inputURL = createInput('');
    inputURL.position(100, 110);

    let divImage = createDiv('file select');
    divImage.style('font-size', '16px');
    divImage.position(20, 142);

    inputImage = createFileInput(handleFile);
    inputImage.position(100, 142);

    let divSlider = createDiv('scale');
    divSlider.style('font-size', '16px');
    divSlider.position(20, 180);

    scaleSlider = createSlider(1, 10, 1, 0.1);
    scaleSlider.position(100, 180);

    previewButton = createButton('preview');
    previewButton.position(120, 220);
    previewButton.mousePressed(preview);

    saveButton = createButton('export');
    saveButton.position(200, 220);
    saveButton.mousePressed(exportImage);

    imageMode(CENTER);
    rectMode(CENTER);

    qrDiv = new QRCode(document.getElementById("qrcode"), {
        width: 256,
        height: 256
    });
    frameRate(5);
}

function draw() {
    background(255);

    if (!isExport) {
        //2480, 3508
        let x, y, w, h;
        x = 600;
        y = 180;
        if (isPortrait) {
            w = width / 10;
            h = height / 10;
        } else {
            h = width / 10;
            w = height / 10;
        }
        fill(255);
        rect(x, y, w, h);
        if (previewImg) {
            image(previewImg, x, y, (previewImg.width * scaleSlider.value()) / 10, (previewImg.height * scaleSlider.value()) / 10);
        }
        if (qrImage) {
            image(qrSample, (x + w / 2) - (20), (y + h / 2) - (20), 20, 20);
        }
        if (title) {
            push();
            fill(0);
            textSize(12);
            text(title, (x - w / 2) + 5, (y + h / 2) - 20);
            pop();
        }
        if (createrName) {
            push();
            fill(0);
            textSize(9);
            text('by ' + createrName, (x - w / 2) + 5, (y + h / 2) - 4);
            pop();
        }
    } else {
        if (isLandscape) {
            resizeCanvas(3508, 2480);
        }
        background(255);
        if (previewImg) {
            image(previewImg, width / 2, height / 2, previewImg.width * scaleSlider.value(), previewImg.height * scaleSlider.value());
        }
        if (qrImage) {
            image(qrImage, width - (qrImage.width / 1), height - (qrImage.height / 1.3));
        }

        if (title) {
            fill(0);
            textSize(120);
            text(title, 50, height - (qrImage.height / 1));
        }
        if (createrName) {
            fill(0);
            textSize(90);
            text('by ' + createrName, 50, height - (qrImage.height / 2.5));
        }
        save(cnv, title, 'png');
        resizeCanvas(2480, 3508);
        isExport = false;
    }
    verticalORHorizontal();
}

function preview() {
    createrName = inputName.value();
    title = inputTitle.value();

    if (p5Img) {
        previewImg = p5Img;
    }

    if (inputURL != null) {
        qrDiv.makeCode(inputURL.value());
        const qrCodeContainer = document.getElementById('qrcode');
        new QRCode(qrCodeContainer, inputURL.value());
        const onGeneratedQrImage = function () {
            const qrCodeImage = qrCodeContainer.children[1];
            const base64 = qrCodeImage.getAttribute('src');
            if (base64 === null) {
                setTimeout(onGeneratedQrImage, 100);
            } else {
                console.log(qrCodeImage);
                console.log(base64);
                qrImage = loadImage(base64);
            }
        };
        setTimeout(onGeneratedQrImage, 100);
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
    isExport = true;
    //save(cnv, 'myCanvas', 'png');
}

function verticalORHorizontal() {

    if (isPortrait === true) {
        portColor = color(255);
    } else {
        portColor = color(100);
    }
    if (isLandscape == true) {
        landColor = color(255);
    } else {
        landColor = color(100);
    }

    push();

    fill(portColor);
    rect(20 + rectSize / 2, 220 + rectSize / 2, rectSize, rectSize);

    fill(landColor);
    rect((20 + rectSize / 2) + rectSize, 220 + rectSize / 2, rectSize, rectSize);

    textSize(30);
    fill(landColor);
    text('P', 24, 243);
    fill(portColor);
    text('L', 50, 243);
    pop();
}

function mouseClicked() {
    if (20 < mouseX && mouseX < 20 + rectSize && 220 < mouseY && mouseY < 220 + rectSize) {
        isPortrait = true;
        isLandscape = false;
    }
    if (20 + rectSize < mouseX && mouseX < 20 + rectSize * 2 && 220 < mouseY && mouseY < 220 + rectSize) {
        isLandscape = true;
        isPortrait = false;
    }
}