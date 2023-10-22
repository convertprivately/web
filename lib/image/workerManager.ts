
type OutstandingType = {
    promise: Promise<ArrayBuffer>;
    resolve: (value: ArrayBuffer | PromiseLike<ArrayBuffer>) => void;
    reject: (reason?: any) => void;
};

export class ImageWorkerManager {
  private _worker: Worker | null = null;
  private _outstanding: OutstandingType | null = null;
  private _latestUpload: ArrayBuffer | null = null;

  private _createWorker() {
    if (this._worker) {
      this.terminate(false);
    }
    console.log("Creating ImageWorkerManager");
    this._worker = new Worker("/imageWorker.js", { type: "module" });
    console.log("Created ImageWorkerManager");
    this._worker.onmessage = this.handleWorkerMessage.bind(this);
    this._worker.onerror = this.handleWorkerError.bind(this);
    if (this._latestUpload) {
      this.uploadPng(this._latestUpload);
    }
  }

  constructor() {
    this._createWorker();
  }

  public handleWorkerMessage(e: MessageEvent) {
    // Only one message type exists from the worker
    if (e.data.console) {
      console.log(e.data.console);
      return;
    } else if (e.data.optimized) {
      const optimized: ArrayBuffer = e.data.optimized;
      console.log("Recv msg", optimized);
      console.log("outstanding", this._outstanding);
      if (this._outstanding) {
        this._outstanding.resolve(optimized);
        // Reset to initial state
        this._outstanding = null;
      }
    } else {
    console.error("Message from image wasm", e.data);
      throw new Error("Unexpected message from worker");
    }
  }

  public handleWorkerError(e: ErrorEvent) {
    if (this._outstanding) {
      this._outstanding.reject(e);
      // Reset to initial state
      this._outstanding = null;
    } else {
      console.error("Error from image wasm");
      console.error(e);
      throw new Error("Unexpected error from worker");
    }
  }

  public uploadPng(arrayBuffer: ArrayBuffer) {
    if (!this._worker) {
      throw new Error("Worker not initialized");
    }
    this._latestUpload = arrayBuffer;
    this._worker.postMessage({ task: "upload_png", arrayBuffer }, [
      arrayBuffer,
    ]);
  }

  public async optimizePng(level: number): Promise<ArrayBuffer> {
    if (!this._worker) {
      throw new Error("Worker not initialized");
    }
    if (this._outstanding) {
      console.warn("Cancelling previous request");
      this._createWorker();
    }

    let resolve: (value: ArrayBuffer | PromiseLike<ArrayBuffer>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<ArrayBuffer>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this._outstanding = { promise, resolve: resolve!, reject: reject! };

    console.log("Posting message to worker: optimize_png" + level);
    this._worker.postMessage({ task: "optimize_png", level });

    return promise;
  }

  public terminate(throws: boolean = true) {
    if (!this._worker) {
      throw new Error("Worker not initialized");
    }
    console.log("Terminating worker");
    this._worker.terminate();

    if (this._outstanding && throws) {
      this._outstanding.reject(new Error("Worker terminated"));
    }
    this._outstanding = null;
  }
}

// const manager = new ImageWorkerManager();