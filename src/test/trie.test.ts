import { describe, it, expect } from 'vitest';
import { Trie } from '@/lib/trie';

describe('Trie Auto-Suggest Data Structure', () => {
    it('should initialize an empty Trie', () => {
        const trie = new Trie();
        expect(trie.root).toBeDefined();
        expect(trie.searchPrefix('test')).toEqual([]);
    });

    it('should insert item names and retrieve matching prefix items', () => {
        const trie = new Trie();
        trie.insert('Kanchipuram Silk Saree', 6999, 'SAR-01');
        trie.insert('Kanchipuram Soft Silk', 5499, 'SAR-02');
        trie.insert('Banarasi Silk Saree', 8999, 'SAR-03');
        trie.insert('Cotton Chudidar Material', 1200, 'CHU-01');

        const kanchiMatches = trie.searchPrefix('kanchi');
        expect(kanchiMatches).toHaveLength(2);
        expect(kanchiMatches.some(m => m.name.includes('kanchipuram silk saree'))).toBe(true);
        expect(kanchiMatches.some(m => m.name.includes('kanchipuram soft silk'))).toBe(true);
    });

    it('should match case-insensitively', () => {
        const trie = new Trie();
        trie.insert('Pure Silk Saree', 7500, 'SAR-10');

        const upperMatches = trie.searchPrefix('PURE');
        expect(upperMatches).toHaveLength(1);
        expect(upperMatches[0].price).toBe(7500);

        const lowerMatches = trie.searchPrefix('pure');
        expect(lowerMatches).toHaveLength(1);
        expect(lowerMatches[0].id).toBe('SAR-10');
    });

    it('should update price when existing item is inserted with new price', () => {
        const trie = new Trie();
        trie.insert('Kanchipuram Silk', 6000, 'SAR-01');
        trie.insert('Kanchipuram Silk', 6500, 'SAR-01');

        const matches = trie.searchPrefix('kanchipuram silk');
        expect(matches).toHaveLength(1);
        expect(matches[0].price).toBe(6500);
    });

    it('should return empty array for non-existent prefix', () => {
        const trie = new Trie();
        trie.insert('Silk Saree', 4500);
        expect(trie.searchPrefix('Diamond')).toEqual([]);
    });
});
