export function getUsedIds(droppedBlocks: (string | null)[]) {
  return new Set(droppedBlocks.filter((id): id is string => id !== null));
}

export function isAllFilled(droppedBlocks: (string | null)[]) {
  return droppedBlocks.every((block) => block !== null);
}
