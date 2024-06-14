const puppeteer = require('puppeteer')
/*const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
    // Читаем HTML файл
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});*/

puppeteer.launch({args: [ '--use-fake-ui-for-media-stream',
                          '--use-fake-device-for-media-stream', 
                          '--use-file-for-fake-audio-capture=~/random_audio.wav',
                          '--use-file-for-fake-audio-capture=~/random_video.mp4',
                          '--no-sandbox',
                          '--disable-web-security' ]/*headless: false*/}).then(async (browser) => {
    const page = await browser.newPage()
    handleConsole(page)
    //await page.goto('http://host.docker.internal:1234/HtmlTest.html')
    await page.goto('http://localhost:3000/HtmlTest.html')
    const startVideoButton = await page.$('#destination')
})


function handleConsole(page) {
    const { blue, cyan, green, magenta, red, yellow } = require('colorette')
    page.on('console', message => {
        const type = message.type().substr(0, 3).toUpperCase()
        const colors = {
            LOG: text => text,
            ERR: red,
            WAR: yellow,
            INF: cyan
        }
        const color = colors[type] || blue
        console.log(color(`${type} ${message.text()}`))
        })
        .on('pageerror', ({ message }) => console.log(red(message)))
        .on('response', response =>
        console.log(green(`${response.status()} ${response.url()}`)))
        .on('requestfailed', request =>
        console.log(magenta(`${request.failure().errorText} ${request.url()}`)))
}
