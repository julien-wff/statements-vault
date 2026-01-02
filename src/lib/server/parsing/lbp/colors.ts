import { color } from 'bun' with { type: 'macro' };

export const green = color('green', 'ansi');
export const magenta = color('magenta', 'ansi');
export const blue = color('blue', 'ansi');
export const black = '\x1B[0m';
