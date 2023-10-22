import * as ImageModule from "./public/image/image.js"
import * as Comlink from "./public/comlink.js"
// importScripts("./image.js")
// importScripts("../comlink.js")

const ImageWorker = {
    async default() {
        await ImageModule.default();
    },

    upload_png(arrayBuffer: ArrayBuffer) {
        return new ImageModule.Png(arrayBuffer)
    },

    optimize_png(png: ImageModule.Png, level: number) {
        return png.optimize(level);
    }
}

Comlink.expose(ImageWorker)