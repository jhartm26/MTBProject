// Libraries
import process from 'process';
import { Mutex } from 'async-mutex';
import mysql from 'mysql2';

// Type declarations
type sqlCache = {
    [index: string]: {
        results: sqlResponse,
        tablename: string,
        hitCount: number
    }
}

type sqlObject = {
    [index: string]: any
}

export type sqlResponse = sqlObject[];

let cache: sqlCache = {};
const maxCache = process.env.MAX_CACHE || 500;

const mutex = new Mutex();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: (process.env.NODE_ENV?.trim() === 'test' ? 
               process.env.MYSQL_TEST_DB : process.env.MYSQL_DB) ||
              process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Truncates the cache object to keep it from overflowing.
 *
 * Truncation is based on the number of cache hits each
 * entry has received. Those with fewer hits will be dropped
 * before those with more.
 */
const truncateCache = () => {
    if (Object.keys(cache).length > maxCache) {
        const newCache: sqlCache = {};
        const sortableArray = [];
        for (const key of Object.keys(cache)) {
            sortableArray.push({
                key,
                hitCount: cache[key].hitCount,
                results: cache[key].results,
                tablename: cache[key].tablename
            });
        }
        sortableArray.sort((a, b) => b.hitCount - a.hitCount);
        let count = 0;
        for (const entry of sortableArray) {
            newCache[entry.key] = {
                hitCount: entry.hitCount,
                results: entry.results,
                tablename: entry.tablename
            };
            count++;
            if (count >= maxCache)
                break;
        }
        cache = newCache;
    }
};

/**
 * Removes all the invalidated cache entries after a table
 * update.
 *
 * While most cache entries that are dropped are likely still
 * valid, this is a very simple system that will keep stale
 * data from being sent in response
 * 
 * @param tablename - The name of the table that got updated
 */
const refreshCacheForTable = (tablename: string) => {
    for (const key of Object.keys(cache))
        if (cache[key].tablename && 
            cache[key].tablename === tablename)
            delete cache[key];
};

/**
 * Generates the cache statement which will
 * be used as the key for the cache dict, and
 * isolates the tablename to be stored in the same
 * dict and later used for cache invalidation
 *
 * @param sql - The sql string of the statement to cache
 * @param params - The query parameters of the statement
 *
 * @returns An object containing the cache statement and the tablename
 */
const generateCacheStmt = (sql: string, params: any[]) => {
    let cacheStmt = sql.trim();
    if (params)
        for (const param of params) {
            cacheStmt = cacheStmt.replace('?', param);
        }

    const arr = sql.split(' ');
    const tablenameIndex = arr.findIndex(entry => entry.toLowerCase().includes('into') ||
                                                  entry.toLowerCase().includes('from') ||
                                                  entry.toLowerCase().includes('exists') ||
                                                  entry.toLowerCase().includes('update')) + 1;
    let tablename: string = undefined;
    if (tablenameIndex > 0)
        tablename = arr[tablenameIndex].replaceAll('`', '').replaceAll('\'', '')
                                       .replaceAll('"', '').replaceAll(';', '')
                                       .trim();
    return { cacheStmt, tablename };
};

/**
 * Checks the cache for the specified cache statement.
 *
 * @param cacheStmt - The cache statement (key) to check the cache for
 *
 * @returns The cached results if found, undefined otherwise
 */
const checkCache = (cacheStmt: string) => {
    if (cache[cacheStmt] &&
        cacheStmt.toLowerCase().includes('select') &&
        !cacheStmt.toLowerCase().includes('max(')) {
        cache[cacheStmt].hitCount += 1;
        return cache[cacheStmt].results;
    }
    return undefined;
};

/**
 * Adds the response to the cache or refreshes the cache for the table
 * referenced based on the cacheStmt contents.
 *
 * @param cacheStmt - The cache statement (key) to identify this cache entry
 * @param tablename - The name of the table referenced in the query
 * @param results - The array of results returned from the query
 *
 */
const addToCache = (cacheStmt: string, tablename: string, results: sqlResponse=undefined) => {
    if (cacheStmt.toLowerCase().includes('select') && results?.length > 0) {
        cache[cacheStmt] = {
            results,
            hitCount: 0,
            tablename
        };
        truncateCache();
    }
    else
        refreshCacheForTable(tablename);
};

/**
 * Promise-based SQL execution.
 * Executes the sql query with the argued parameters.
 *
 * @param sql - The sql query to execute
 * @param params - The array of parameters to be passed to the sql query
 * @param forceNoCache - If true, forces the program to ignore the cache when creating its response
 *
 * @returns A promise that resolves into an array of objects that result from the SQL query
 *
 */
export async function sqlExecute(sql: string, params: any[]=undefined, forceNoCache: boolean=false): Promise<sqlResponse> {
    // Temporary solution for db treating dates strangely
    if (params?.length > 0)
        for(let i = 0; i < params.length; i++)
            if (params[i]?.constructor?.name === 'Date')
                    params[i] = (params[i] as Date).toISOString().split('T')[0];

    mutex.acquire();
    const { cacheStmt, tablename } = generateCacheStmt(sql, params);
    return new Promise((resolve, reject) => {
        const cacheRes = checkCache(cacheStmt);
        if (cacheRes && !forceNoCache) {
            mutex.release();
            return resolve(cacheRes);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            }

            const cbFunc = (err: Error, results: any[]) => {
                if (err) {
                    return reject(err);
                }
                addToCache(cacheStmt, tablename, results);
                resolve(results);
            };

            if (params) {
                const statement = mysql.format(sql, params);
                connection.query(statement, cbFunc);
            }
            else {
                connection.query(sql, cbFunc);
            }
            mutex.release();
            connection.release();
        });
    });
}

export default sqlExecute;