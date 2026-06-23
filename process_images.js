const Jimp = require('jimp');
const fs = require('fs');

async function processImage(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    
    // Invert colors so black lines become white and white background becomes black
    image.invert();
    
    // Make black pixels transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is dark (was white before invert, now black), make it transparent
      if (red < 50 && green < 50 && blue < 50) {
        this.bitmap.data[idx + 3] = 0; // Alpha to 0
      } else {
        // Boost brightness of the white lines
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
        this.bitmap.data[idx + 3] = 255;
      }
    });

    await image.writeAsync(outputPath);
    console.log('Successfully processed:', outputPath);
  } catch (err) {
    console.error('Error processing image:', inputPath, err);
  }
}

// Find the latest media files uploaded by the user
const brainDir = 'C:\\\\Users\\\\Ali Reja\\\\.gemini\\\\antigravity-ide\\\\brain\\\\c7ca4589-a8db-4eac-868b-e7420d36f5cd';
const files = fs.readdirSync(brainDir);

const boyImages = files.filter(f => f.startsWith('media__') && f.endsWith('.jpg') && fs.statSync(`${brainDir}/${f}`).size === 33972);
const girlImages = files.filter(f => f.startsWith('media__') && f.endsWith('.jpg') && fs.statSync(`${brainDir}/${f}`).size === 25976);

if (boyImages.length > 0) {
  processImage(`${brainDir}/${boyImages[0]}`, 'public/boy_transparent.png');
}
if (girlImages.length > 0) {
  processImage(`${brainDir}/${girlImages[0]}`, 'public/girl_transparent.png');
}
