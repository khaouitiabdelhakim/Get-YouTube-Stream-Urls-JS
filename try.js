const { Mutex } = require("async-mutex");

const mutex = new Mutex(); // Create a mutex for locking

const FORMAT_MAP = {
  249: {
    itag: 249,
    type: "webm",
    vCodec: "NONE",
    aCodec: "OPUS",
    bitrate: 48,
    adaptive: true,
  },
  250: {
    itag: 250,
    type: "webm",
    vCodec: "NONE",
    aCodec: "OPUS",
    bitrate: 64,
    adaptive: true,
  },
  251: {
    itag: 251,
    type: "webm",
    vCodec: "NONE",
    aCodec: "OPUS",
    bitrate: 160,
    adaptive: true,
  },
};

const FactoryState = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  LOADING: "LOADING",
  INIT: "INIT",
};

const jsExecuting = {
  wait: (timeout) => new Promise((resolve) => setTimeout(resolve, timeout)),
  signal: () => {}, // This will be a function that signals when execution is complete
};

const refContext = {};

const CACHE_FILE_NAME = "decipher_js_funct";
let ytFiles = null;
let state = FactoryState.INIT;
let videoMeta = null;
let decipheredSignature = null;
let decipherJsFileName = null;
let decipherFunctions = null;
let decipherFunctionName = null;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";
const patPlayerResponse = /var ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/;
const patSigEncUrl = /url=(.+?)(\u0026|$)/;
const patSignature = /s=(.+?)(\u0026|$)/;
const patVariableFunction =
  /([{; =])([a-zA-Z$][a-zA-Z0-9$]{0,2})\.([a-zA-Z$][a-zA-Z0-9$]{0,2})\(/;
const patFunction = /([{; =])([a-zA-Z\$_][a-zA-Z0-9$]{0,2})\(/;
const patDecryptionJsFile = /\\\/s\\\\\/player\\\\\/([^\"]+?)\.js/;
const patDecryptionJsFileWithoutSlash = /\/s\/player\/([^\"]+?)\.js/;
const patSignatureDecFunction =
  /(?:\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{1,4})\s*=\s*function\(\s*a\s*\)\s*\{\s*a\s*=\s*a\.split\(\s*\"\"\s*\)/;
const retryCount = 3;

async function getStreamUrls(videoID) {
  const encSignatures = new Map();
  const ytFiles = new Map();
  let pageHtml;
  let urlConnection = null;
  let reader = null;
  const getUrl = `https://youtube.com/watch?v=${videoID}`;

  try {
    urlConnection = await fetch(getUrl, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
    pageHtml = await urlConnection.text();
  } finally {
    if (reader) reader.close();
  }

  const mat = patPlayerResponse.exec(pageHtml);
  if (mat) {
    const ytPlayerResponse = JSON.parse(mat[1]);
    const streamingData = ytPlayerResponse.streamingData;

    const adaptiveFormats = streamingData.adaptiveFormats;
    parseFormats(
      adaptiveFormats,
      ytFiles,
      encSignatures,
      patSigEncUrl,
      patSignature
    );
  } else {
    console.log("ytPlayerResponse was not found");
  }

  if (encSignatures.size > 0) {
    let curJsFileName;
    let mat = patDecryptionJsFile.exec(pageHtml);
    if (!mat) mat = patDecryptionJsFileWithoutSlash.exec(pageHtml);
    if (mat) {
      curJsFileName = mat[0].replace(/\\\//g, "/");
      if (!decipherJsFileName || decipherJsFileName !== curJsFileName) {
        decipherFunctions = null;
        decipherFunctionName = null;
      }
      decipherJsFileName = curJsFileName;
    }
    console.log(
      `Decipher signatures: ${encSignatures.size}, videos: ${ytFiles.size}`
    );
  
    decipheredSignature = null;
    if (await decipherSignature(encSignatures)) {
      console.log("Deciphered signature correctly");
      const release = await mutex.acquire(); // Acquire the lock
      try {
        await jsExecuting.wait(7 * 1000); // Wait for up to 7 seconds for jsExecuting to signal
      } finally {
        release(); // Release the lock
      }
    } else {
      console.error("Could not decipher signature");
    }
  
    const signature = decipheredSignature;
    if (!signature) {
      console.error("Could not decipher signature");
      return null;
    } else {
      const sigs = signature.split("\n").filter((s) => s.trim() !== "");
      let i = 0;
      for (let key of encSignatures.keys()) {
        let url = ytFiles.get(key).url;
        url += `&sig=${sigs[i]}`;
        const newFile = { type: FORMAT_MAP[key], url };
        ytFiles.set(key, newFile);
        i++;
      }
    }
  }
  
  if (ytFiles.size === 0) {
    if (LOG_TAG) console.log(pageHtml);
    return null;
  }

  return ytFiles;
}

function parseFormats(
  formats,
  ytFiles,
  encSignatures,
  patSigEncUrl,
  patSignature
) {
  if (formats) {
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      const type = format.type;
      if (type === "FORMAT_STREAM_TYPE_OTF") continue;
      const itag = format.itag;
      if (FORMAT_MAP[itag]) {
        if (format.url) {
          let url = format.url.replace("\\u0026", "&");
          ytFiles.set(itag, { type: FORMAT_MAP[itag], url });
        } else if (format.signatureCipher) {
          const mat = patSigEncUrl.exec(format.signatureCipher);
          const matSig = patSignature.exec(format.signatureCipher);
          if (mat && matSig) {
            const url = decodeURIComponent(mat[1]);
            const signature = decodeURIComponent(matSig[1]);
            ytFiles.set(itag, { type: FORMAT_MAP[itag], url });
            encSignatures.set(itag, signature);
          }
        }
      }
    }
  }
}

async function testHttp403Code(url) {
  let urlConnection = null;
  try {
    const response = await fetch(url, {
      method: "HEAD", // Send a HEAD request to check the status code without downloading the content
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
    if (response.status === 403) {
      return true;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (urlConnection) {
      urlConnection.disconnect();
    }
  }
  return false;
}

async function decipherViaWebView(encSignatures) {
  let stb = `${decipherFunctions} function decipher(){return `;
  const keys = Array.from(encSignatures.keys());
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i < keys.length - 1) {
      stb += `${decipherFunctionName}('` + encSignatures.get(key) + "')+'\\n'+";
    } else {
      stb += `${decipherFunctionName}('` + encSignatures.get(key) + "')";
    }
  }
  stb += "};decipher();";

  // Execute the JavaScript code using eval()
  try {
    const result = eval(stb);
    decipheredSignature = result;
    jsExecuting.signal();
  } catch (error) {
    console.error(error);
    jsExecuting.signal();
  }
}

async function decipherSignature(encSignatures) {
  // Assume the functions don't change that much
  if (!decipherFunctionName || !decipherFunctions) {
    const decipherFunctUrl = `https://youtube.com${decipherJsFileName}`;
    try {
      const response = await fetch(decipherFunctUrl, {
        headers: {
          "User-Agent": USER_AGENT,
        },
      });
      const javascriptFile = await response.text();

      console.log(`Decipher FunctURL: ${decipherFunctUrl}`);

      let mat = patSignatureDecFunction.exec(javascriptFile);
      if (mat) {
        decipherFunctionName = mat[1];

        console.log(`Decipher Functname: ${decipherFunctionName}`);

        const patMainVariable = new RegExp(
          `(var |\\s|,|;)${decipherFunctionName.replace(
            "$",
            "\\$"
          )}(=function\\((.{1,3})\\)\\{)`
        );
        mat = patMainVariable.exec(javascriptFile);
        let mainDecipherFunct;
        if (mat) {
          mainDecipherFunct = `var ${decipherFunctionName}${mat[2]}`;
        } else {
          const patMainFunction = new RegExp(
            `function ${decipherFunctionName.replace(
              "$",
              "\\$"
            )}(\\((.{1,3})\\)\\{)`
          );
          mat = patMainFunction.exec(javascriptFile);
          if (!mat) return false;
          mainDecipherFunct = `function ${decipherFunctionName}${mat[2]}`;
        }

        let startIndex = mat.index + mat[0].length;
        let braces = 1;
        let i = startIndex;
        while (i < javascriptFile.length) {
          if (braces === 0 && startIndex + 5 < i) {
            mainDecipherFunct += javascriptFile.substring(startIndex, i) + ";";
            break;
          }
          if (javascriptFile[i] === "{") braces++;
          else if (javascriptFile[i] === "}") braces--;
          i++;
        }
        decipherFunctions = mainDecipherFunct;

        console.log(`Main Decipher Function: ${mainDecipherFunct}`);

        // Search the main function for extra functions and variables needed for deciphering
        // Search for variables
        var max = 0;
        while ((mat = patVariableFunction.exec(mainDecipherFunct))) {
          const variableDef = `var ${mat[2]}={`;
          if (decipherFunctions.includes(variableDef)) {
            max++;
            if (max > 10) break;
            console.log(`variables: ${variableDef}`);
            continue;
          }
          let startIndex =
            javascriptFile.indexOf(variableDef) + variableDef.length;
          let bracesVariable = 1;
          let i1 = startIndex;
          while (i1 < javascriptFile.length) {
            if (bracesVariable === 0) {
              decipherFunctions += `${variableDef}${javascriptFile.substring(
                startIndex,
                i1
              )};`;
              break;
            }
            if (javascriptFile[i1] === "{") bracesVariable++;
            else if (javascriptFile[i1] === "}") bracesVariable--;
            i1++;
          }
        }

        // Search for functions
        while ((mat = patFunction.exec(mainDecipherFunct))) {
          const functionDef = `function ${mat[2]}(`;
          if (decipherFunctions.includes(functionDef)) {
            continue;
          }
          startIndex =
            javascriptFile.indexOf(functionDef, mat.index) + functionDef.length;
          let bracesFunction = 0;
          let i2 = startIndex;
          while (i2 < javascriptFile.length) {
            if (bracesFunction === 0 && startIndex + 5 < i2) {
              decipherFunctions += `${functionDef}${javascriptFile.substring(
                startIndex,
                i2
              )};`;
              break;
            }
            if (javascriptFile[i2] === "{") bracesFunction++;
            else if (javascriptFile[i2] === "}") bracesFunction--;
            i2++;
          }
        }

        console.log(`Decipher Functions: ${decipherFunctions}`);

        decipherViaWebView(encSignatures);
      } else {
        return false;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return false;
    }
  } else {
    decipherViaWebView(encSignatures);
  }
  return true;
}

const videoID = "tZLDEUFtnX0";
const LOG_TAG = true;

(async () => {
  try {
    const ytFiles = await getStreamUrls(videoID);
    if (ytFiles) {
      console.log("YouTube Files:", ytFiles);
    } else {
      console.log("No YouTube files found.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
