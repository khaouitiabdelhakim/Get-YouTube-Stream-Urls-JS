// use.js
const getStreamUrl = require("./axioso");

// Video ID for testing
const videoID = "3TYwrnJCBdg";

// Main execution block
(async () => {
    const file = await getStreamUrl(videoID);
    if (file) {
      console.log(file);
    } else {
      console.log("No YouTube files found.");
    }
})();
