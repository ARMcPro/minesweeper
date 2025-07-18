# Minesweeper

Minesweeper is a logic-based puzzle game where the objective is to clear a grid of hidden mines without detonating any of them.

The goal is to reveal all cells that **do not** contain mines.

## Controls
- **Left-click** or **short tap** a cell to reveal it.
- **Right-click** or **long tap** a cell to flag it as a suspected mine.
- Clicking on a **revealed cell** with the correct number of adjacent flags will **reveal all surrounding hidden cells** (known as *chording*).

## Rules
- Start by revealing any cell. The first click is always safe and will reveal a region of empty or numbered cells.
- A number on a cell shows how many mines are in the **8 surrounding cells**.
- If a revealed cell shows nothing (meaning 0 mines around it), the game will automatically reveal adjacent cells until numbered cells are found.
- Revealing a cell with a mine ends the game.
- Reveal all **safe** cells to win.

\
https://armcpro.github.io/minesweeper/