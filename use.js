// use.js
const getStreamUrl = require("./index");

// Video ID for testing
const videoID = "c9Y1-pOph-o";

// Main execution block
(async () => {
    const file = await getStreamUrl(videoID);
    if (file) {
      console.log(file);
    } else {
      console.log("No YouTube files found.");
    }
})();
