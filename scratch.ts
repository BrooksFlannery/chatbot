import { db } from '@/lib/db';
console.log(Object.keys((db as any).schema || {}));