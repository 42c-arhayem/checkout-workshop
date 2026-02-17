import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILENAME = new RegExp('^[a-zA-Z0-9._-]{5,256}$');
const URL_WHITELIST = new RegExp('^https:\\/\\/drive\\.usercontent\\.google\\.com\\/download\\?id=[A-Za-z0-9_-]{33}$');

// Helper function to download and store an external file
const downloadFile = async (fileUrl, outputLocationPath) => {
  const response = await axios({
    method: 'GET',
    url: fileUrl,
    responseType: 'stream',
  });

  if (response.headers['content-type'] !== 'application/octet-stream') {
    throw new Error(response);
  }

  const writer = fs.createWriteStream(outputLocationPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const fileResolvers = {
  Query: {
    // Get a file
    getFile: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      // input validation
      if (!input.filename || typeof input.filename !== "string") {
        throw new Error("invalid input");
      }

      const uploadDir = path.join(__dirname, '..', '..', 'app', 'downloads'); // Directory where files are stored
      const filename = input.filename;
      const filePath = path.join(uploadDir, filename);

      // BUG: OWASP A01:2021  (Broken Access Control)
      // Description: the filename input is vulnerable to path traversal attacks
      // Solution: 
      // if (!FILENAME.test(filename)) {
      //     throw new Error("invalid input");
      // }

      return new Promise((resolve, reject) => {
        // Check if file exists
        fs.stat(filePath, (err, stats) => {
          if (err) {
            reject(new Error("File not found."));
            return;
          }

          // Read file and return base64 or path
          // For GraphQL, we'll return the file path since we can't send binary data directly
          // In a real implementation, you might want to return a URL or base64 encoded data
          resolve(filePath);
        });
      });
    }
  },

  Mutation: {
    // Create/download a file from external source
    createFile: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { url } = input;

      if (!url || (typeof url !== "string")) {
        throw new Error("invalid input");
      }

      // BUG: OWASP API-7  (Server-side Request Forgery)
      // Description: the url input is vulnerable to SSRF
      // Solution: 
      // if(!URL_WHITELIST.test(url)) {
      //     throw new Error("invalid input");
      // }

      const fileName = url.split("id=")[1]; // get the file Id from the URL
      const outputPath = path.resolve(__dirname, '..', '..', 'app', 'downloads', `${fileName}.pdf`);

      try {
        // Create the downloads folder if it doesn't exist
        const downloadDir = path.resolve(__dirname, '..', '..', 'app', 'downloads');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }

        await downloadFile(url, outputPath);

        return { message: `File downloaded and saved` };
      } catch (err) {
        console.log("Catching error in createFile: ", err);

        if (err.response) {
          throw new Error(`Error downloading the file: ${err.response.message}`);
        } else {
          throw new Error(`Error downloading the file: ${err.code || err.message}`);
        }
      }
    }
  }
};

export default fileResolvers;
