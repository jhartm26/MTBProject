// Libraries
import process from 'process';
import { Mutex } from 'async-mutex';
import mysql from 'mysql2';

// Type declarations
export type sqlObject = {
    [index: string]: any
}

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
export async function sqlExecute(sql: string, params: any[]=undefined, forceNoCache: boolean=false): Promise<sqlObject[]> {
    await mutex.acquire();
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            }

            const cbFunc = (err: Error, results: any[]) => {
                if (err) {
                    return reject(err);
                }
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