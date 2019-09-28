const createTransformerPlugin = require('../lib').default;

module.exports = exports.default = createTransformerPlugin({
    libraryName: new RegExp(`(^@q7/athena-gen/?$)|(^@q7/athena-gen/lib/?$)|(^@q7/athena-gen/lib/entity-fields/?$)|(^@q7/athena-gen/lib/entity-interfaces/?$)|(^@q7/athena-gen/src/?$)|(^@q7/athena-gen/src/entity-fields/?$)|(^@q7/athena-gen/src/entity-interfaces/?$)`),
    customName(option) {
        const { value, name, isDefaultImport } = option;
        if (!value) {
            console.log('???', value, option)
        }
        return customName(value, isDefaultImport)(name);
    }
});

module.exports.customName = customName;

function customName(value, isDefaultImport) {

    return (name) => {
        // import { F_TenantUser_account, EN_Account, IAccountingBook, ENUM_BankAccountType } from '/athena-gen';
        console.log('customName testPlugin', value, name);

        let newVal = `${value}`;
        if (!isDefaultImport) {
            if (name.startsWith('EN_')) {

                newVal = `${value}/entity-names`;

            } else if (name.startsWith('ENUM_')) {

                newVal = `${value}/enums`;

            } else if (name.startsWith('F_')) {

                const matchList = name.match(/F_([^_]+)/) || [];
                const entityName = matchList[1];

                if (entityName) {
                    newVal = `${value}${!value.includes('/entity-fields') ? '/entity-fields' : ''}/${entityName}`;
                }

            } else if (/^I[A-Z]/.test(name)) {

                newVal = `${value}${!value.includes('/entity-interfaces') ? '/entity-interfaces' : ''}/${name}`;
            }
        }

        if (!/^@q7\/athena-gen\/lib\//.test(newVal)) {
            if (!/^@q7\/athena-gen\/src\//.test(newVal)) {
                newVal = newVal.replace(/(@q7\/athena-gen\/)/, `$1lib/`)
            }
        }

        return newVal.replace(/\/[\/]+/g, '/');
    };
}
