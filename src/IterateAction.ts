
/**
 * An action to perform on the source as instructed by the iterator.
 */
export const enum IterateAction
{
  /**
   * Continue iteration.
   */
  CONTINUE,

  /**
   * Stop iteration.
   */
  STOP,

  /**
   * Remove the current item if possible, and continue iteration.
   */
  REMOVE,

  /**
   * Replace the current item with the provided value.
   */
  REPLACE
}