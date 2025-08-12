import { BoardLineUtils } from '../BoardLineUtils';
import type { CellPosition } from '../../../types/game';

describe('BoardLineUtils', () => {
  
  describe('getAllLines', () => {
    it('should return 8 lines total', () => {
      const lines = BoardLineUtils.getAllLines();
      expect(lines).toHaveLength(8);
    });

    it('should have 3 columns, 3 rows, and 2 diagonals', () => {
      const lines = BoardLineUtils.getAllLines();
      const columns = lines.slice(0, 3);
      const rows = lines.slice(3, 6);
      const diagonals = lines.slice(6, 8);

      expect(columns).toHaveLength(3);
      expect(rows).toHaveLength(3);
      expect(diagonals).toHaveLength(2);
    });

    it('should have each line with exactly 3 cells', () => {
      const lines = BoardLineUtils.getAllLines();
      lines.forEach(line => {
        expect(line).toHaveLength(3);
      });
    });
  });

  describe('getLinesContainingCell', () => {
    it('should return 4 lines for center cell (b2)', () => {
      const lines = BoardLineUtils.getLinesContainingCell('b2');
      expect(lines).toHaveLength(4);
    });

    it('should return 3 lines for corner cells', () => {
      const corners: CellPosition[] = ['a1', 'a3', 'c1', 'c3'];
      corners.forEach(corner => {
        const lines = BoardLineUtils.getLinesContainingCell(corner);
        expect(lines).toHaveLength(3);
      });
    });

    it('should return 2 lines for side cells', () => {
      const sides: CellPosition[] = ['a2', 'b1', 'b3', 'c2'];
      sides.forEach(side => {
        const lines = BoardLineUtils.getLinesContainingCell(side);
        expect(lines).toHaveLength(2);
      });
    });
  });

  describe('cell type detection', () => {
    it('should correctly identify center cell', () => {
      expect(BoardLineUtils.isCenterCell('b2')).toBe(true);
      expect(BoardLineUtils.isCenterCell('a1')).toBe(false);
    });

    it('should correctly identify corner cells', () => {
      expect(BoardLineUtils.isCornerCell('a1')).toBe(true);
      expect(BoardLineUtils.isCornerCell('a3')).toBe(true);
      expect(BoardLineUtils.isCornerCell('c1')).toBe(true);
      expect(BoardLineUtils.isCornerCell('c3')).toBe(true);
      expect(BoardLineUtils.isCornerCell('b2')).toBe(false);
    });

    it('should correctly identify side cells', () => {
      expect(BoardLineUtils.isSideCell('a2')).toBe(true);
      expect(BoardLineUtils.isSideCell('b1')).toBe(true);
      expect(BoardLineUtils.isSideCell('b3')).toBe(true);
      expect(BoardLineUtils.isSideCell('c2')).toBe(true);
      expect(BoardLineUtils.isSideCell('b2')).toBe(false);
    });

    it('should return correct cell type', () => {
      expect(BoardLineUtils.getCellType('b2')).toBe('center');
      expect(BoardLineUtils.getCellType('a1')).toBe('corner');
      expect(BoardLineUtils.getCellType('a2')).toBe('side');
    });
  });

  describe('line type getters', () => {
    it('should return correct columns', () => {
      const columns = BoardLineUtils.getColumns();
      expect(columns).toHaveLength(3);
      expect(columns[0]).toEqual(['a1', 'a2', 'a3']);
      expect(columns[1]).toEqual(['b1', 'b2', 'b3']);
      expect(columns[2]).toEqual(['c1', 'c2', 'c3']);
    });

    it('should return correct rows', () => {
      const rows = BoardLineUtils.getRows();
      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual(['a1', 'b1', 'c1']);
      expect(rows[1]).toEqual(['a2', 'b2', 'c2']);
      expect(rows[2]).toEqual(['a3', 'b3', 'c3']);
    });

    it('should return correct diagonals', () => {
      const diagonals = BoardLineUtils.getDiagonals();
      expect(diagonals).toHaveLength(2);
      expect(diagonals[0]).toEqual(['a1', 'b2', 'c3']);
      expect(diagonals[1]).toEqual(['a3', 'b2', 'c1']);
    });
  });

  describe('line finding for cells', () => {
    it('should find correct column for cell', () => {
      const column = BoardLineUtils.getColumnForCell('a2');
      expect(column).toEqual(['a1', 'a2', 'a3']);
    });

    it('should find correct row for cell', () => {
      const row = BoardLineUtils.getRowForCell('b1');
      expect(row).toEqual(['a1', 'b1', 'c1']);
    });

    it('should find diagonals for center cell', () => {
      const diagonals = BoardLineUtils.getDiagonalsForCell('b2');
      expect(diagonals).toHaveLength(2);
      expect(diagonals).toContainEqual(['a1', 'b2', 'c3']);
      expect(diagonals).toContainEqual(['a3', 'b2', 'c1']);
    });

    it('should find one diagonal for corner cell', () => {
      const diagonals = BoardLineUtils.getDiagonalsForCell('a1');
      expect(diagonals).toHaveLength(1);
      expect(diagonals[0]).toEqual(['a1', 'b2', 'c3']);
    });
  });

  describe('cell relationships', () => {
    it('should detect cells on same line', () => {
      expect(BoardLineUtils.areCellsOnSameLine('a1', 'a2')).toBe(true); // Same column
      expect(BoardLineUtils.areCellsOnSameLine('a1', 'b1')).toBe(true); // Same row
      expect(BoardLineUtils.areCellsOnSameLine('a1', 'b2')).toBe(true); // Same diagonal
      expect(BoardLineUtils.areCellsOnSameLine('a1', 'c2')).toBe(false); // No common line
    });

    it('should find common lines between cells', () => {
      const commonLines = BoardLineUtils.getCommonLines('a1', 'a2');
      expect(commonLines).toHaveLength(1);
      expect(commonLines[0]).toEqual(['a1', 'a2', 'a3']);
    });

    it('should find third cell in line', () => {
      const thirdCell = BoardLineUtils.getThirdCellInLine('a1', 'a2');
      expect(thirdCell).toBe('a3');
    });

    it('should return null for cells not on same line', () => {
      const thirdCell = BoardLineUtils.getThirdCellInLine('a1', 'c2');
      expect(thirdCell).toBeNull();
    });
  });

  describe('configuration validation', () => {
    it('should validate configuration as correct', () => {
      expect(BoardLineUtils.validateConfiguration()).toBe(true);
    });
  });

  describe('line count verification', () => {
    it('should have correct line counts for all cells', () => {
      // Center: 4 lines
      expect(BoardLineUtils.getLineCountForCell('b2')).toBe(4);
      
      // Corners: 3 lines each
      expect(BoardLineUtils.getLineCountForCell('a1')).toBe(3);
      expect(BoardLineUtils.getLineCountForCell('a3')).toBe(3);
      expect(BoardLineUtils.getLineCountForCell('c1')).toBe(3);
      expect(BoardLineUtils.getLineCountForCell('c3')).toBe(3);
      
      // Sides: 2 lines each
      expect(BoardLineUtils.getLineCountForCell('a2')).toBe(2);
      expect(BoardLineUtils.getLineCountForCell('b1')).toBe(2);
      expect(BoardLineUtils.getLineCountForCell('b3')).toBe(2);
      expect(BoardLineUtils.getLineCountForCell('c2')).toBe(2);
    });
  });
});