import { describe, it, expect } from 'vitest';
import { classifyTileAttr } from '../../shared/game/navigation/tile-classification';

describe('Tile Classification', () => {
  describe('free tiles', () => {
    it('classifies 0x00 as free', () => {
      expect(classifyTileAttr(0x00)).toEqual({ type: 'free' });
    });

    it('classifies slopes as free', () => {
      expect(classifyTileAttr(0x11)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x13)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x19)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x1b)).toEqual({ type: 'free' });
    });

    it('classifies grass/diggable as free', () => {
      expect(classifyTileAttr(0x04)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x40)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x44)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x48)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x4a)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x4b)).toEqual({ type: 'free' });
    });

    it('classifies 0xD0-0xEF range as free', () => {
      expect(classifyTileAttr(0xd0)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0xe0)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0xef)).toEqual({ type: 'free' });
    });
  });

  describe('obstacles', () => {
    it('classifies bushes as lift.1', () => {
      expect(classifyTileAttr(0x50)).toEqual({ type: 'obstacle', req: 'lift.1' });
      expect(classifyTileAttr(0x51)).toEqual({ type: 'obstacle', req: 'lift.1' });
    });

    it('classifies light rocks as lift.2', () => {
      expect(classifyTileAttr(0x52)).toEqual({ type: 'obstacle', req: 'lift.2' });
      expect(classifyTileAttr(0x55)).toEqual({ type: 'obstacle', req: 'lift.2' });
    });

    it('classifies dark rocks as lift.3', () => {
      expect(classifyTileAttr(0x53)).toEqual({ type: 'obstacle', req: 'lift.3' });
      expect(classifyTileAttr(0x56)).toEqual({ type: 'obstacle', req: 'lift.3' });
    });

    it('classifies 0x54 as hammer peg (NOT lift.2)', () => {
      expect(classifyTileAttr(0x54)).toEqual({ type: 'obstacle', req: 'hammer' });
    });

    it('classifies 0x57 as boots (bonk rock)', () => {
      expect(classifyTileAttr(0x57)).toEqual({ type: 'obstacle', req: 'boots' });
    });
  });

  describe('water', () => {
    it('classifies deep water as water type', () => {
      expect(classifyTileAttr(0x08)).toEqual({ type: 'water' });
      expect(classifyTileAttr(0x0b)).toEqual({ type: 'water' });
    });

    it('classifies shallow water (0x09, 0x0A) as free', () => {
      expect(classifyTileAttr(0x09)).toEqual({ type: 'free' });
      expect(classifyTileAttr(0x0a)).toEqual({ type: 'free' });
    });
  });

  describe('blocked', () => {
    it('classifies walls as blocked', () => {
      expect(classifyTileAttr(0x01)).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x02)).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x03)).toEqual({ type: 'blocked' });
    });

    it('classifies cliff faces as blocked', () => {
      expect(classifyTileAttr(0x10)).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x18)).toEqual({ type: 'blocked' });
    });

    it('classifies cliff triggers as blocked', () => {
      expect(classifyTileAttr(0x28)).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x2f)).toEqual({ type: 'blocked' });
    });

    it('classifies hookshot target (0x27) as blocked', () => {
      expect(classifyTileAttr(0x27)).toEqual({ type: 'blocked' });
    });
  });

  describe('special', () => {
    it('classifies 0x20 as pit', () => {
      expect(classifyTileAttr(0x20)).toEqual({ type: 'pit' });
    });
  });

  describe('interior contexts (tile_detect is_indoors)', () => {
    it('uses indoor overrides for attrs that differ from overworld', () => {
      expect(classifyTileAttr(0x04, 'interior-house')).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x0b, 'interior-house')).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x6c, 'interior-house')).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x6f, 'interior-house')).toEqual({ type: 'blocked' });
    });

    it('keeps core liftables and hookshot posts consistent indoors', () => {
      expect(classifyTileAttr(0x27, 'interior-dungeon')).toEqual({ type: 'blocked' });
      expect(classifyTileAttr(0x50, 'interior-dungeon')).toEqual({ type: 'obstacle', req: 'lift.1' });
      expect(classifyTileAttr(0x54, 'interior-dungeon')).toEqual({ type: 'obstacle', req: 'hammer' });
      expect(classifyTileAttr(0x70, 'interior-dungeon')).toEqual({ type: 'obstacle', req: 'lift.1' });
    });

    it('has same attr semantics for house/cave/dungeon contexts currently', () => {
      const attrs = [0x04, 0x0b, 0x27, 0x50, 0x58, 0x70, 0xc3, 0xf2];
      for (const attr of attrs) {
        const house = classifyTileAttr(attr, 'interior-house');
        const cave = classifyTileAttr(attr, 'interior-cave');
        const dungeon = classifyTileAttr(attr, 'interior-dungeon');
        expect(cave).toEqual(house);
        expect(dungeon).toEqual(house);
      }
    });
  });
});
