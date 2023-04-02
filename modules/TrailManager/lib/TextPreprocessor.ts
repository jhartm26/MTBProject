import sqlExecute from '../../SQLInterface';

export default class TextPreprocessor {
    async assignTrails(text: string, accountUUID: string) {
        const trails = await sqlExecute('SELECT trail_UUID as uuid FROM soc_med_trail_assoc WHERE social_UUID = ?', [accountUUID]);
        let names: any[] = [];
        for (const { uuid } of trails) {
            const trail = (await sqlExecute('SELECT name FROM trails WHERE UUID = ?', [uuid]))[0];
            names.push({
                name: trail.name,
                uuid: uuid
            });
        }

        const sentences = text.split('.');
        let sepped: string[] = [];
        for (const sub of sentences) {
            for (const subsub of sub.split('\n')) {
                sepped.push(subsub);
            }
        }

        let resultDict: any = {};
        for (let substr of sepped) {
            substr = substr.trim();
            if (resultDict[substr] === undefined && substr.length > 0) {
                resultDict[substr] = [];
                for (const { name, uuid } of names) {
                    if (substr.includes(name))
                        resultDict[substr].push({ name, uuid });
                    else if (substr.toLowerCase().replaceAll(/[ \r\t\n]/g, '').includes(name.toLowerCase().replaceAll(/[ \r\t\n]/g, '')))
                        resultDict[substr].push({ name, uuid });
                    else {
                        const splitname = name.split(' ');
                        for (const n in splitname)
                            if (substr.includes(n)) {
                                resultDict[substr].push({ name, uuid });
                                break;
                            }
                    }
                }
                if (resultDict[substr].length === 0)
                    resultDict[substr] = names;
            }
        }

        let previous = [];
        for (const key of Object.keys(resultDict))
            previous.push(resultDict[key]);
        
        let same = true;
        const curr = previous[0];
        for (let i = 1; i < previous.length; i++) {
            for (let j = 0; j < previous[i].length; j++) {
                if (curr[j].uuid !== previous[i][j].uuid) {
                    same = false;
                    break;
                }
            }
        }

        if (same) {
            let final: any = {};
            final[text] = curr;
            return final;
        }
        else
            return resultDict;
    }
}