import { writable } from 'svelte/store';
import type { ScanResult } from './parser';

export interface HistoryItem {
    id: string;
    result: ScanResult;
    timestamp: number;
    source: 'camera' | 'image';
}

const STORAGE_KEY = 'qanner_history';

function createHistory() {
    const isBrowser = typeof window !== 'undefined';
    const initialItems: HistoryItem[] = isBrowser 
        ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') 
        : [];
    
    const { subscribe, set, update } = writable<HistoryItem[]>(initialItems);

    return {
        subscribe,
        add: (result: ScanResult, source: 'camera' | 'image') => {
            update(items => {
                const newItem: HistoryItem = {
                    id: crypto.randomUUID(),
                    result,
                    timestamp: Date.now(),
                    source
                };
                const newItems = [newItem, ...items].slice(0, 50);
                if (isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
                return newItems;
            });
        },
        remove: (id: string) => {
            update(items => {
                const newItems = items.filter(i => i.id !== id);
                if (isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
                return newItems;
            });
        },
        clear: () => {
            set([]);
            if (isBrowser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

export const history = createHistory();
