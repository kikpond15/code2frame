# Code2Frame
Code2frame works with [openProcessing](https://openprocessing.org/) to provide a format for decorating the code in the frame.

https://kikpond15.github.io/code2frame/

## How to use
1. Create a program with openProcessing and post it
2. Take a screenshot of the program execution screen
3. Copy the URL of openProcessing
4. In Code2frame, enter the title, author and copied URL, then choose the screenshot (you can also drop or paste it)
5. Pick the paper size, orientation and image size — the preview updates as you type
6. `Download PNG` (300 dpi) or `Print / PDF`

When printing, set the scale to 100% and margins to none so the sheet matches the paper size.

## Development
A static site with no build step: `index.html`, `style.css` and `js/app.js`. QR codes are generated with [qrcodejs](https://github.com/davidshimjs/qrcodejs) (`vendor/`).

```
python3 -m http.server
```

### Event header
For workshops and events, a line of text can be printed at the top of every sheet. Edit `config.js` (`enabled` and `text`) and publish it; there is no switch for it in the UI.

The original p5.js version is kept in `legacy/`.

![code2frame](https://user-images.githubusercontent.com/29980030/142581548-4c4cc1c7-9ea1-4c29-8efd-e68d55a89167.gif)
<img src="img/code2frame.JPG" width="640">
