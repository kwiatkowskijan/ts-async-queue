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

    // Add task to queue and start processing tasks
    push(task: T, finishTaskCb?: () => void): void {
        this.queue.push({ task, finishTaskCb });
        this.processQueue();
    }

    // Processing tasks
    async processQueue() {
        while (this.activeTasks < this.concurrency && !this.isEmpty() && !this.isPaused) {
            const taskItem = this.queue.shift();
            if (!taskItem) break;
            this.activeTasks++;

            try {
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

    // Waits for all tasks in the queue to be completed
    async waitForAll(): Promise<void> {
        while (this.activeTasks > 0 || !this.isEmpty()) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    // Return length of queue
    length(): number {
        return this.queue.length;
    }

    // Check if queue is empty
    isEmpty(): boolean {
        if (this.length() <= 0) return true;
        else return false;
    }

    // Pause queue
    pause(): void {
        this.isPaused = true;
        console.log("Pause")
    }

    // Resume queue
    resume(): void {
        this.isPaused = false;
        console.log("Resume")
        this.processQueue();
    }
}