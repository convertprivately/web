import * as ImageModule from "/image/image.js";
// let png: Png | null = null;
let png = null;

function print(msg) {
    self.postMessage({"console": msg})
}

async function init() {
    print("before init")
    await ImageModule.default();
    print("after init")

    // self.onmessage = function (e: {data: { task: string, arrayBuffer?: ArrayBuffer, level?: number }}) {
    self.onmessage = function (e) {
        if (e.data.task === "upload_png") {
            if (!e.data.arrayBuffer) {
                throw new Error("Missing 'arrayBuffer' in the payload");
            }
            png = new ImageModule.Png(e.data.arrayBuffer);
        } else if (e.data.task === "optimize_png") {
            if (!e.data.level) {
                throw new Error("Missing 'level' in the payload");
            }
            if (!png) {
                throw new Error("Preceding 'upload_png' task has not been called");
            }
            print("before optimize")
            const optimized = png.optimize(e.data.level);
            print("after optimize")
            self.postMessage({optimized}, [optimized]);
        } else {
            throw new Error("Unknown task: " + e.data.task);
        }
    }
}

init();

