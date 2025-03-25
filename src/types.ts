export type WorkerFunktion<T> = (value: T) => Promise<void>;

export interface AsyncWorkerQueue<T> {
    push: (task: T, finishTaskCb?: () => void) => void;
    waitForAll: () => Promise<void>;
    length: () => number;
    isEmpty: () => boolean;
    pause: () => void;
    resume: () => void;
}

export interface AsyncWorkerQueueConstructor<T> {
    new(workerFunction: WorkerFunktion<T>, concurrency: number) :AsyncWorkerQueue<T>;
}

export function createAsyncWorkerQueue<T>(
    ctor: AsyncWorkerQueueConstructor<T>,
    workerFunction: WorkerFunktion<T>,
    concurrency: number): AsyncWorkerQueue<T> {
    return new ctor(workerFunction, concurrency);
}