// import Client from 'ts-postgres';
// import { ResultRow } from 'ts-postgres/dist/src/result';
import { messageDBConnect } from '../safeMessageDB/messageDBConnect';
import QRCode from 'qrcode';
import { Pool, PoolClient, QueryResult } from 'pg';

export class Code {

    private static sortChars(str: string): string {
        let arr: string[] = [];
        for (let i: number = 0; i < str.length; i++) {
            arr.push(str[i]);
        }
        return arr.sort().join('');
    }

    private static async isAvailable(client: PoolClient, code: string): Promise<boolean> {
        var isAvailable: boolean = true;
        // Check if code exists in database. Get "next" code if it exists in the database
        const query = {
            rowMode: 'array',
            text: 'SELECT $1 FROM "Message" WHERE code = $2;',
            values: ['time_submitted', code],
        }
        var result: QueryResult<any> = await client.query(query);
        // console.log(result);
        // if (result.rowCount !== 0 || Code.isExpired()) {}
        if (result.rowCount !== 0) {
            isAvailable = false;
        }
        return isAvailable;
    }

    public static async genCode(client: PoolClient): Promise<string> {
        const max: number = 64;
        const min: number = 32;
        const code_length = Code.randInt(max, min);
        const dictionary: string = Code.sortChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");

        // Generate random code
        let code_combination: number[] = [];
        for (let i: number = 0; i < code_length; i++) {
            code_combination.push(Code.randInt(dictionary.length - 1));
        }

        var isAvailable: boolean = await Code.isAvailable(client, Code.renderCode(code_combination, dictionary));
        if (!isAvailable) {
            // Get "next" possible code
            code_combination = await Code.getNextCode(client, code_combination, code_length, dictionary, max, min);
        }

        return Code.renderCode(code_combination, dictionary);
    }

    private static async checkCombinations(client: PoolClient, code_combination: number[], code_length: number, index: number, dictionary: string): Promise<number[]> {
        const code = Code.renderCode(code_combination.slice(0, code_combination.length - 2), dictionary);

        const query = {
            rowMode: 'array',
            text: 'SELECT code FROM "Message" WHERE code LIKE $1 AND char_length(code) = $2',
            values: [code, code_combination.length],
        }
        var result: QueryResult<any> = await client.query(query);

        let existing_codes: string[] = [];
        console.log(result.rows);
        for (let row of result.rows) {
            existing_codes.push(String(row.code));
        }
        // In the loop, we need to increment curr by 1, because we know that the code combination with curr isn't valid
        // All this does is cycle through every value in the dictionary until it reaches the original value
        let init: number = code_combination[index];
        let i: number = (init !== (dictionary.length - 1)) ? (init + 1) : 0;
        code_combination[index] = i;
        do {
            code_combination[index] = i;
            const renderedCode = Code.renderCode(code_combination, dictionary);
            if (!existing_codes.includes(renderedCode)) {
                return code_combination;
            }
            i = (i !== (dictionary.length - 1)) ? (i + 1) : 0;
        } while (i !== init);

        // Returns either a new, available code, or the original code if none is available
        return code_combination;
    }

    // TODO: Clean up this code, it could definitely be combined with checkCombinations somehow
    private static async getNextCode(client: PoolClient, code_combination: number[], code_length: number, dictionary: string, max: number, min: number, index: number = 0): Promise<number[]> {
        if (index === code_length - 1) {
            // We are at the last index in the array
            await Code.checkCombinations(client, code_combination, code_length, index, dictionary);
        } else {
            let init: number = code_combination[index];
            let i: number = (init !== (dictionary.length - 1)) ? (init + 1) : 0;
            do {
                let new_code_combination: number[] = await Code.getNextCode(client, code_combination, code_length, dictionary, max, min, index + 1);
                if (code_combination !== new_code_combination) {
                    code_combination = new_code_combination;
                    break;
                }
                i = (i !== (dictionary.length - 1)) ? (i + 1) : 0;
                code_combination[index] = i;
            } while (i !== init);
        }
        return code_combination;
    }

    private static renderCode(code_combination: number[], dictionary: string): string {
        let code: string = "";
        code_combination.forEach(char => {
            code += (dictionary[char]);
        });
        return code;
    }

    // TODO: Doesn't work for some reason?
    private static renderCodeCombination(code: string, dictionary: string): number[] {
        let code_combination: number[] = [];
        for(var i: number = 0; i < code.length; i++){
            code_combination.push(dictionary.indexOf(code[i]));
        }
        return code_combination;
    }

    private static randInt(max: number, min: number = 0) {
        // Make sure min and max are integers
        max = Math.floor(max + 1);
        min = Math.floor(min);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static genURL(page: string, code: string): string {
        if (page[page.length - 1] === "/") {
            page += ("/");
        }
        return page + "#" + code;
    }

    public static genQRcode(url: string) {
        let canvas = document.getElementById('qrcode');
        QRCode.toCanvas(canvas, url);
    }
}