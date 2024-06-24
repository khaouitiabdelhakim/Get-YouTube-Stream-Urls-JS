// use.js
const getStreamUrl = require("./index");

// Video ID for testing
const videoID = "cIvfeuLq7eM";

// Main execution block
(async () => {
    const file = await getStreamUrl(videoID);
    if (file) {
      console.log(file);
    } else {
      console.log("No YouTube files found.");
    }
})();
