const ts = require('typescript')
const fs = require('fs')
const { resolve } = require('path')
const { expect } = require('chai')

const transformerFactory = require('../lib').default
const hookTransformer = require('./hook-config');

const printer = ts.createPrinter()

const fixtureDir = fs.readdirSync(resolve(__dirname, 'fixtures'))
const fixtureSpecialDir = fs.readdirSync(resolve(__dirname, 'fixtures-special'))

function camel2Dash(_str = '') {
  const str = (_str[0] || '').toLowerCase() + _str.substr(1)
  return str.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`)
}

describe('should work with custom name', () => {
  const transformer = hookTransformer;

  fixtureSpecialDir.forEach(v => {
    it(`compile ${v}`, () => {

      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures-special', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      // fs.writeFileSync(resolve(__dirname, 'actual', v), resultCode, 'utf-8')

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'custom-name', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with less', () => {
  //   const transformer = transformerFactory({ style: true })
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: option.type !== 'ImportSpecifier' || !option.localName,
          },
        option.type === 'ImportSpecifier' && {
          value: `antd/lib/${camel2Dash(option.name)}/style/index.js`,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'less', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with css', () => {
  //   const transformer = transformerFactory({ style: 'css' })
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: !option.localName,
          },
        option.type === 'ImportSpecifier' && {
          value: `antd/lib/${camel2Dash(option.name)}/style/css.js`,
        }
      ]
    }),
  })
  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      fs.writeFileSync(resolve(__dirname, 'actual', v), resultCode, 'utf-8')

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'css', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with css.web', () => {
  //   const transformer = transformerFactory({ style: 'css.web' })
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: !option.localName,
          },
        option.type === 'ImportSpecifier' && {
          value: `antd/lib/${camel2Dash(option.name)}/style/css.web.js`,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'css.web', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})


describe('should compile with custom style path generator', () => {
  //   const transformer = transformerFactory({ style: (path) => `${path}/style/index.styl` })
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: !option.localName,
          },
        option.type === 'ImportSpecifier' && {
          value: `antd/lib/${camel2Dash(option.name)}/style/index.styl`,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'with-custom-style-path-generator', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with custom style path generator ignore', () => {
  //   const transformer = transformerFactory({
  //     style: (path) => {
  //       if (path === 'antd/lib/alert') {
  //         return false
  //       }
  //       return `${path}/style/index.styl`
  //     },
  //   })
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: !option.localName,
          },
        option.name !== 'Alert' && option.type === 'ImportSpecifier' && {
          value: `antd/lib/${camel2Dash(option.name)}/style/index.styl`,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'with-custom-style-path-generator-ignore', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})


describe('should compile without style', () => {
  //   const transformer = transformerFactory()
  // const defaultOptions = {
  // 	libraryName: 'antd',
  // 	libraryDirectory: 'lib',
  // 	style: false,
  // 	camel2DashComponentName: true,
  // 	transformToDefaultImport: true,
  // 	resolveContext: [],
  //   }
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Dash(option.name)}`,
            isDefaultImport: !option.localName,
          },
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'without-style', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})


describe('should compile lodash library', () => {
  //   const transformer = transformerFactory({
  //     style: false,
  //     libraryName: 'lodash',
  //     libraryDirectory: null,
  //     camel2DashComponentName: false
  //   })
  const transformer = transformerFactory({
    libraryName: 'lodash',
    customName: (option => {
      return option.type === 'NamespaceImport' ? option : [
        {
          importedName: option.type === 'ImportSpecifier' ? option.localName && 'default' : undefined,
          localName: option.localName || option.importedName,
          value: `${option.value}/${option.name}`,
          isDefaultImport: option.type !== 'ImportSpecifier' || !option.localName,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'lodash', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile lodash library', () => {
  //   const transformer = transformerFactory({
  //     style: false,
  //     libraryName: 'lodash',
  //     libraryDirectory: null,
  //     camel2DashComponentName: false
  //   })

  const transformer = transformerFactory({
    libraryName: 'lodash',
    customName: (option => {
      return option.type === 'NamespaceImport' ? option : [
        {
          importedName: option.type === 'ImportSpecifier' ? option.localName && 'default' : undefined,
          localName: option.localName || option.importedName,
          value: `${option.value}/${option.name}`,
          isDefaultImport: option.type !== 'ImportSpecifier' || !option.localName,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      //   fs.writeFileSync(resolve(__dirname, 'actual', v), resultCode, 'utf-8')

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'lodash', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with camel2UnderlineComponentName', () => {
  //   const transformer = transformerFactory({
  //     style: false,
  //     camel2UnderlineComponentName: true
  //   })
  function camel2Underline(_str = '') {
    const str = (_str[0] || '').toLowerCase() + _str.substr(1)
    return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`)
  }
  const transformer = transformerFactory({
    libraryName: 'antd',
    customName: (option => {
      return [
        option.type !== 'ImportSpecifier'
          ? option
          : {
            importedName: option.localName ? 'default' : option.importedName,
            localName: option.localName || option.importedName,
            value: `antd/lib/${camel2Underline(option.name)}`,
            isDefaultImport: !option.localName,
          },
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'camel-2-underline', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})


describe('should compile with transformToDefaultImport', () => {
  //   const transformer = transformerFactory({
  //     libraryDirectory: '../_esm2015/internal/operators',
  //     libraryName: 'rxjs/operators',
  //     style: false,
  //     camel2DashComponentName: false,
  //     transformToDefaultImport: false
  //   })

  const transformer = transformerFactory({
    libraryName: 'rxjs/operators',
    customName: (option => {
      const isDefaultImport = false;
      return option.type === 'NamespaceImport' ? option : [
        {
          importedName: option.type === 'ImportSpecifier' ? (option.localName && isDefaultImport ? 'default' : option.importedName) : undefined,
          localName: option.localName || option.importedName,
          value: `rxjs/_esm2015/internal/operators/${(option.name)}`,
          isDefaultImport,
          //option.type !== 'ImportSpecifier' || !option.localName,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'transform-to-default-import', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with custom libraryDirectory resolver', () => {
  //   const transformer = transformerFactory({
  //     libraryDirectory: importName => {
  //       const stringVec = importName.split(/([A-Z][a-z]+|[0-9]*)/)
  //         .filter(s => s.length)
  //         .map(s => s.toLocaleLowerCase())

  //       return stringVec
  //         .reduce((acc, cur, index) => {
  //           if (index > 1) {
  //             return acc + '-' + cur
  //           } else if (index === 1) {
  //             return acc + '/' + cur
  //           }
  //           return acc + cur
  //         }, '')
  //     },
  //     libraryName: 'material-ui/svg-icons',
  //     style: false,
  //     camel2DashComponentName: false
  //   })

  const libraryDirectory = importName => {
    const stringVec = importName.split(/([A-Z][a-z]+|[0-9]*)/)
      .filter(s => s.length)
      .map(s => s.toLocaleLowerCase())

    return stringVec
      .reduce((acc, cur, index) => {
        if (index > 1) {
          return acc + '-' + cur
        } else if (index === 1) {
          return acc + '/' + cur
        }
        return acc + cur
      }, '')
  }

  const transformer = transformerFactory({
    libraryName: 'material-ui/svg-icons',
    customName: (option => {
      const isDefaultImport = true;
      return option.type === 'NamespaceImport' ? option : [
        {
          importedName: option.type === 'ImportSpecifier' ? (option.localName && isDefaultImport ? 'default' : option.importedName) : undefined,
          localName: option.localName || option.importedName,
          value: `${option.value}/${libraryDirectory(option.importedName)}`,
          isDefaultImport,
          //option.type !== 'ImportSpecifier' || !option.localName,
        }
      ]
    }),
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'custom-library-resolver', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with an array of options', () => {
  //   const transformer = transformerFactory([
  //     {
  //       style: false,
  //       libraryName: 'lodash',
  //       libraryDirectory: null,
  //       camel2DashComponentName: false
  //     }, {
  //       style: false,
  //       libraryName: 'material-ui',
  //       libraryDirectory: '',
  //       camel2DashComponentName: false
  //     }
  //   ])

  const transformer = transformerFactory([
    {
      libraryName: 'lodash',
      customName: (option => {
        const isDefaultImport = true;
        return option.type === 'NamespaceImport' ? option : [
          {
            importedName: option.type === 'ImportSpecifier' ? (option.localName && isDefaultImport ? 'default' : option.importedName) : undefined,
            localName: option.localName || option.importedName,
            value: `${option.value}/${option.importedName}`,
            isDefaultImport,
            //option.type !== 'ImportSpecifier' || !option.localName,
          }
        ]
      }),
    },
    {
      libraryName: 'material-ui',
      customName: (option => {
        const isDefaultImport = true;
        const importPath = `${option.value}/${option.importedName}`;
        try {
          require.resolve(importPath, {
            paths: [process.cwd()],
          })

          return option.type === 'NamespaceImport' ? option : [
            {
              importedName: option.type === 'ImportSpecifier' ? (option.localName && isDefaultImport ? 'default' : option.importedName) : undefined,
              localName: option.localName || option.importedName,
              value: importPath,
              isDefaultImport,
              //option.type !== 'ImportSpecifier' || !option.localName,
            }
          ]
        } catch (err) {
          // console.log('path err', importPath, err);
          return option;
        }
      }),
    }
  ])

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'options-array', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})
