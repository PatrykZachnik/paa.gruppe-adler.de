import setupAFF from '@/utils/aff';

/**
 * Reads file as a array buffer
 * @param {File} file file to read
 */
function readFile (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = e => reject(e);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Generate a image from an paa file object
 * @param {File} file Paa file
 * @returns {Promise<ImageData>} Image Data
 */
export async function convertPaaToImage (file) {
    const AFF = await setupAFF();
    const arrayBuffer = await readFile(file);
    const uint8array = new Uint8Array(arrayBuffer);

    // eslint-disable-next-line new-cap
    const pixelVector = new AFF.pixelVector();
    const paa = new AFF.Paa();

    try {
        // place Uint8Array into pixelVector
        pixelVector.resize(uint8array.length, 0);
        for (let i = 0; i < uint8array.length; i++) {
            pixelVector.set(i, uint8array[i]);
        }

        // actually read paa data
        paa.readPaaData(pixelVector, false);

        /**
         * Holds lzoCompressed, height, width, dataLength and data
         */
        const mipmap = paa.mipMaps.get(0);

        // place data from mipmap into Uint8ClampedArray
        const uint8ClampedArray = new Uint8ClampedArray(mipmap.data.size());
        for (let i = 0; i < mipmap.data.size(); i++) {
            uint8ClampedArray[i] = mipmap.data.get(i);
        }

        const imageData = new ImageData(uint8ClampedArray, mipmap.width, mipmap.height);

        // cleanup
        pixelVector.delete();
        paa.delete();

        return imageData;
    } catch (err) {
        // cleanup
        pixelVector.delete();
        paa.delete();

        AFF.getExceptionMessage(err);
        throw err;
    }
}

/**
 * Generate a paa from an ImageData object
 * @param {ImageData} data image data
 * @returns {Promise<Blob>} the paa as a blob
 */
export async function convertImageToPaa (data) {
    const AFF = await setupAFF();
    const { data: uint8ClampedArray, width, height } = data;

    // eslint-disable-next-line new-cap
    const pixelVector = new AFF.pixelVector();
    const paa = new AFF.Paa();
    const mipMaps = new AFF.MipMaps();

    let paaData;

    try {
        // place data from array into pixel vector
        pixelVector.resize(uint8ClampedArray.length, 0);
        for (let i = 0; i < uint8ClampedArray.length; i++) {
            pixelVector.set(i, uint8ClampedArray[i]);
        }

        // create mipMap and place it into the paa
        const mipMap = {
            height,
            width,
            data: pixelVector,
            dataLength: pixelVector.size(),
            lzoCompressed: false
        };
        mipMaps.push_back(mipMap);
        paa.mipMaps = mipMaps;

        paa.calculateMipmapsAndTaggs();
        paaData = paa.writePaaData(AFF.TypeOfPaX.UNKNOWN);
    } catch (err) {
        // cleanup
        pixelVector.delete();
        paa.delete();
        mipMaps.delete();

        throw err;
    }

    // place data from paa into Uint8Array
    const uint8array = new Uint8Array(paaData.size());
    for (let i = 0; i < paaData.size(); i++) {
        uint8array[i] = paaData.get(i);
    }
    // cleanup
    pixelVector.delete();
    paa.delete();
    mipMaps.delete();
    paaData.delete();

    return new Blob([uint8array.buffer], { type: 'application/octet-stream' });
}

/**
 * Terminate worker
 */
export async function terminate () {
    close();
}
