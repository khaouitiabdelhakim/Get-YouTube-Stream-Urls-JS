# YouTube Stream URL Extractor

## Overview

This JavaScript module extracts stream URLs for YouTube videos. It parses HTML content to find the necessary data and deciphers signatures to obtain the actual stream URLs. The module is primarily designed for Node.js environments but can be adapted for browser usage with appropriate adjustments.

## Usage

```javascript
// Import the module
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
```

## How It Works

- The module fetches the HTML content of a YouTube video page using the provided video ID.
- It then parses the HTML to extract necessary information, such as the `ytInitialPlayerResponse` object and streaming formats.
- Signatures are deciphered using JavaScript evaluation.
- Finally, the module returns the stream URL of the video.

## Configuration

- Set the `LOGGING` variable to `true` to enable logging for debugging purposes.

## Notes

- This module may not work if YouTube changes its HTML structure or signature algorithm significantly.
- Use responsibly and adhere to YouTube's terms of service.

## Author

- **Khaouiti Abdelhakim**
- GitHub: [khaouitiabdelhakim](https://github.com/khaouitiabdelhakim)

