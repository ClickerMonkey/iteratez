/**
 * An action to perform on the source as instructed by the iterator.
 */
export declare const enum IterateAction {
    /**
     * Continue iteration.
     */
    CONTINUE = 0,
    /**
     * Stop iteration.
     */
    STOP = 1,
    /**
     * Remove the current item if possible, and continue iteration.
     */
    REMOVE = 2,
    /**
     * Replace the current item with the provided value.
     */
    REPLACE = 3
}
