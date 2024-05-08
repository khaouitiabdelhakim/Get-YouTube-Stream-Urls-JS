// use.js
const getStreamUrl = require("./index");

// Video ID for testing
const videoID = "NudUovOABjQ";

// Main execution block
(async () => {
    const file = await getStreamUrl(videoID);
    if (file) {
      console.log("YouTube file found:", file);
    } else {
      console.log("No YouTube files found.");
    }
})();
