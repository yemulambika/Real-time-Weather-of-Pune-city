const http = require("http");
const fs = require("fs");
const path = require("path");
const requests = require("requests");

const homeFile = fs.readFileSync("home.html", "utf-8");

// Function to replace placeholders
const replaceVal = (tempVal, orgVal) => {
    let updatedTemplate = tempVal;
    updatedTemplate = updatedTemplate.replace("{%tempval%}", orgVal.main.temp);
    updatedTemplate = updatedTemplate.replace("{%tempmin%}", orgVal.main.temp_min);
    updatedTemplate = updatedTemplate.replace("{%tempmax%}", orgVal.main.temp_max);
    updatedTemplate = updatedTemplate.replace("{%location%}", orgVal.name);
    updatedTemplate = updatedTemplate.replace("{%country%}", orgVal.sys.country);
    updatedTemplate = updatedTemplate.replace("{%tempstatus%}", orgVal.weather[0].main);
    return updatedTemplate;
};

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        // Serve the home page
        requests(
            "https://api.openweathermap.org/data/2.5/weather?q=Pune&appid=6ddd06c16b84bc453db3878b319f4312&units=metric"
        )
            .on("data", (chunk) => {
                const objdata = JSON.parse(chunk);
                const realTimeData = replaceVal(homeFile, objdata);
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(realTimeData);
            })
            .on("error", (err) => {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h1>Internal Server Error</h1>");
            });
    } else if (req.url.endsWith(".css")) {
        // Serve CSS files
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>404: File Not Found</h1>");
            } else {
                res.writeHead(200, { "Content-Type": "text/css" });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404: Page Not Found</h1>");
    }
});

// Start the server
server.listen(8000, "127.0.0.1", () => {
    console.log("Server is running at http://127.0.0.1:8000/");
});
