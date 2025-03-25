import { AsyncWorkerQueue, WorkerFunktion } from "./types";

export class Queue<T> implements AsyncWorkerQueue<T> {

    queue: { task: T, finishTaskCb?: () => void }[] = [];
    activeTasks: number = 0;
    isPaused: boolean = false;
    workerFunction: WorkerFunktion<T>;
    concurrency: number;

    constructor(workerFunction: WorkerFunktion<T>, concurrency: number) {
        this.workerFunction = workerFunction;
        this.concurrency = concurrency;
    }

    push(task: T, finishTaskCb?: () => void): void {
        this.queue.push({ task, finishTaskCb });
        this.processQueue();
    }

    async processQueue() {
        while (this.activeTasks < this.concurrency && !this.isEmpty() && !this.isPaused) {
            const taskItem = this.queue.shift();
            if (!taskItem) break;

            try {
                this.activeTasks++;
                await this.workerFunction(taskItem.task);
                if (taskItem.finishTaskCb) {
                    taskItem.finishTaskCb();
                }
            } catch (error) {
                console.error("ERROR: " + error);
            } finally {
                this.activeTasks--;
                this.processQueue();
            }
        }
    }

    async waitForAll(): Promise<void> {
        while (this.activeTasks > 0 || !this.isEmpty()) {            
            // const promise = new Promise(resolve => setTimeout(resolve, 50));
            // console.log(promise);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    length(): number {
        return this.queue.length;
    }

    isEmpty(): boolean {
        if (this.length() <= 0) return true;
        else return false;
    }

    pause(): void {
        this.isPaused = true;
        console.log("Pause")
    }

    resume(): void {
        this.isPaused = false;
        console.log("Resume")
        this.processQueue();
    }
}