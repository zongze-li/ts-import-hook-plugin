const createTransformerPlugin = require('../lib').default;

module.exports = exports.default = createTransformerPlugin({
    libraryName: new RegExp(`(/athena-gen/?((lib)|(src))?/?((entity-fields)|(entity-interfaces)|(entity-constants))?/?$)`),
    customName(option) {
        const { value, name, isDefaultImport } = option;
        if (!value) {
            console.log('???', value, option)
        }
        return customName(value, isDefaultImport)(name);
    }
});

module.exports.customName = customName;


function customName(value, isDefaultImport, importedName) {

	return (name) => {
		// import { F_TenantUser_account, EN_Account, IAccountingBook, ENUM_BankAccountType } from '@q7/athena-gen';

		let newVal = `${value}`;

		if (value.includes('@root/gen') && !isDefaultImport) {
			if (name.startsWith('FC_')) {

				newVal = `@root/gen/form-constants/${name}`;

			} else if (name.endsWith('Constants')) {

				newVal = `@q7/athena-gen/lib/entity-constants/${name}`;

			} else {
				// N.B: 直接当做引入 @q7/athena-gen 包里的内容就行了
				value = '@q7/athena-gen';
			}
		}

		if (value.includes('@q7/athena-gen') && !isDefaultImport) {

			if (name.startsWith('EN_')) {

				newVal = `@q7/athena-gen/lib/entity-names`;

			} else if (name.startsWith('ENUM_')) {

				newVal = `@q7/athena-gen/lib/enums`;

			} else if (name.startsWith('F_')) {

				const matchList = name.match(/F_([^_]+)/) || [];
				const entityName = matchList[1];

				if (entityName) {
					newVal = `${value}${!value.includes('/entity-fields') ? '/entity-fields' : ''}/${entityName}`;
				}

			} else if (/^I[A-Z]/.test(name)) {

				newVal = `${value}${!value.includes('/entity-interfaces') ? '/entity-interfaces' : ''}/${name}`;

			} else if (name.endsWith('Constants')) {
				// case: ResourceConstants => import { ResourceConstants } from "@q7/athena-gen/lib";

				newVal = `@q7/athena-gen/lib/entity-constants/${name}`;
			}

			// N.B: 作为以上转换不正确的修复，如中间差了 '/lib/' 之类的
			if (!/\/athena-gen\/lib(\/|$)/.test(newVal)) {
				if (!/\/athena-gen\/src(\/|$)/.test(newVal)) {
					newVal = newVal.replace(/(\/athena-gen\/)/, `$1lib/`)
				}
			}

			importedName = importedName || '';
			if (importedName === 'SettingKeys') {
				newVal = value.replace(/\/athena-gen\/.*/, '/athena-gen/lib/setting-keys-enum')
			}
			if (importedName === 'HttpErrorCodes') {
				newVal = value.replace(/\/athena-gen\/.*/, '/athena-gen/lib/server-errors')
			}

		}


		// console.log('customName testPlugin', value, name, newVal);

		return newVal.replace(/\/[\/]+/g, '/');
	};
}

