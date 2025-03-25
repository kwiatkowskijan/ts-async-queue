import { createAsyncWorkerQueue } from './types';
import { Queue } from './queue';

const workerFunction = async (value: number) => {
    const duration = Math.random() * 1000 * value;
    await new Promise(r => setTimeout(r, duration));
    console.log(`${value} waited for ${duration} ms`);
};

async function main() {
    // Create a queue for an async worker function with 3 concurrent workers
    const queue = createAsyncWorkerQueue<number>(Queue, workerFunction, 3
    );
    // Add some data to the queue
    queue.push(10, () => console.log("Task 10 finished"));
    queue.push(9);
    queue.push(8, () => console.log("Task 8 finished"));
    queue.push(7);
    queue.push(6, () => console.log("Task 6 finished"));
    queue.push(5);
    queue.push(4, () => console.log("Task 4 finished"));
    queue.push(3);
    queue.push(2, () => console.log("Task 2 finished"));
    queue.push(1);
                    
    // Test pause/resume
    setTimeout(() => {
        queue.pause();
        setTimeout(() => {
            queue.resume();
        }, 15000);
    }, 1000);

    // Wait until all workers finished
    await queue.waitForAll();
    console.log('All done!');
}
main();