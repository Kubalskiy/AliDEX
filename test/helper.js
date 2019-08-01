/**
 * Helper methods for tests to get idea how we can convert and iterate data
 * in the UI side.
 */
module.exports = {
    convertToStringArray(bytes) {
        let singleString = this.convertToSingleString(bytes);
        return this.splitStringsToArray(singleString);
    },

    splitStringsToArray(singleString) {
        let params = [];
        let res = "";
        for (let i = 0; i <= singleString.length; i++) {
            if (singleString.charCodeAt(i) > 31) {
                res += singleString[i];
            } else {
                params.push(res);
                res = "";
            }
        }
        params.pop();
        return params;
    },

    convertToSingleString(bytes) {
        let str = '';
        for (let i = 0; i < bytes.length; i += 2) {
            let value = parseInt(bytes.substr(i, 2), 16);
            if (value) {
                str += String.fromCharCode(value);
            }
        }
        return str;
    },

    getUsersThatCanAddStorefronts(users) {
        let owners = [];
        for (let i = 0; i < users[1].length; i++) {
            // 1 == shop owner, 2 == admin
            if (parseInt(users[1][i]) === 1 || parseInt(users[1][i]) === 2) {
                owners.push(users[0][i]);
            }
        }
        return owners;
    }
};
