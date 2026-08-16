const fs = require('fs');

const path = '/Users/meena/.gemini/antigravity-ide/brain/90454eae-bca1-427d-9520-b41b0d46553b/.system_generated/steps/5/content.md';
try {
  const data = fs.readFileSync(path, 'utf8');
  // the data is HTML. Let's see if we can find a JSON string
  const matches = data.match(/<script[^>]*>(.*?)<\/script>/gs);
  if (matches) {
    for (const match of matches) {
      if (match.includes('Metadata in Egocentric Recording')) {
        console.log("Found match!");
        // print a chunk
        console.log(match.substring(0, 1000));
      }
    }
  } else {
    console.log("No scripts found");
  }
} catch (err) {
  console.error(err);
}
