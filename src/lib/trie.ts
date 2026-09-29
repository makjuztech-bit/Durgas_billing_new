// Trie node representing each character in the item name
export class TrieNode {
    children: { [key: string]: TrieNode };
    isEndOfWord: boolean;
    // Store the last known price and ID (or other metadata) for the item at this node
    price: number | null;
    id: string | null;

    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.price = null;
        this.id = null;
    }
}

// Trie data structure for storing and retrieving item names and their last known price
export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    // Insert an item name along with its price and ID
    insert(word: string, price: number, id: string = ''): void {
        const lowerWord = word.toLowerCase();
        let current = this.root;

        for (let i = 0; i < lowerWord.length; i++) {
            const char = lowerWord[i];
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }

        current.isEndOfWord = true;
        // Update price to the latest seen price
        current.price = price;
        current.id = id;
    }

    // Search for all words with the given prefix
    // Returns an array of objects containing the word and its price
    searchPrefix(prefix: string): { name: string, price: number, id: string }[] {
        const lowerPrefix = prefix.toLowerCase();
        let current = this.root;
        const results: { name: string, price: number, id: string }[] = [];

        // Traverse to the end of the prefix
        for (let i = 0; i < lowerPrefix.length; i++) {
            const char = lowerPrefix[i];
            if (!current.children[char]) {
                return results; // Prefix not found
            }
            current = current.children[char];
        }

        // Helper function for DFS to find all words from the current node
        const dfs = (node: TrieNode, path: string) => {
            if (node.isEndOfWord && node.price !== null) {
                // Return original name capitalization if possible, but here we just return the path (lowercase)
                results.push({ name: path, price: node.price, id: node.id || '' });
            }

            for (const char in node.children) {
                dfs(node.children[char], path + char);
            }
        };

        dfs(current, lowerPrefix);
        return results;
    }
}
