const sharp = require('sharp');

// Compresses PNG/JPEG images
async function compress(imgDataURL) {
  // Handle PNG compression
  if (imgDataURL === '') return;

  if (imgDataURL.includes('data:image/png')) {
    const imgData = imgDataURL.split(';base64,')[1];
    const bufferedImgData = Buffer.from(imgData, 'base64');

    const compressedPNG = await sharp(bufferedImgData)
      .toFormat('png')
      .resize({ width: 150 })
      .png({ quality: 100 })
      .toBuffer();

    const compressedPNG_DataURL = ` data:image/png;base64,${compressedPNG.toString(
      'base64'
    )};`;

    return compressedPNG_DataURL;

    // Handle JPEG compression
    } else if (imgDataURL.includes('data:image/jpeg')) {
        const imgData = imgDataURL.split(';base64,')[1];
        const bufferedImgData = Buffer.from(imgData, 'base64');

        const compressedJPEG = await sharp(bufferedImgData)
        .toFormat('jpeg')
        .resize({ width: 150 })
        .jpeg({ quality: 100 })
        .toBuffer();

        const compressedJPEG_DataURL = `data:image/jpeg;base64,${compressedJPEG.toString(
        'base64'
        )}`;

        return compressedJPEG_DataURL;

        // Throw error if the image is not of type JPEG or PNG
    } else throw new Error('Could not compress image');
}

module.exports = {
  compress,
};