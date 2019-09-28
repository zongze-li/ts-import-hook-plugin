import * as ts from 'typescript'

// Partial<Options> | Array<Partial<Options>>
export function createTransformer(_options = {}) {

  const transformer = (context) => {
    const visitor = (node) => {
      if (ts.isSourceFile(node)) {
        return ts.visitEachChild(node, visitor, context)
      }
      if (!ts.isImportDeclaration(node)) {
        return node
      }

      const importedLibName = node.moduleSpecifier.text;
      const value = importedLibName;
      // console.log('value', value);
      const options = [].concat(_options).find((opt) => {
        let { libraryName = '' } = opt;
        let matched = false;
        if (typeof libraryName === 'function') {
          matched = libraryName(value);
        } else {
          libraryName = String(libraryName);
          if (/^\/.*\/$/.test(libraryName)) {
            matched = new RegExp(libraryName.slice(1, -1)).test(value);
          }
        }
        return value === libraryName || matched;
      })

      if (!options) {
        return node
      }

      const newSpecsData = [];
      const prevSpecsData = [];
      collectSpecsData(node, prevSpecsData, newSpecsData, options, value);

      if (prevSpecsData.length === newSpecsData.length) {
        // N.B: 如果没发生变化，则直接return退出，防止死循环；to avoid endless loop.
        const isChanged = prevSpecsData.some((item, idx) => {
          const newItem = newSpecsData[idx];
          // console.log('?', item, newItem);
          const ret = (
            newItem.value !== item.value ||
            newItem.importedName !== item.importedName ||
            newItem.localName !== item.localName ||
            newItem.type !== item.type ||
            newItem.isDefaultImport !== item.isDefaultImport
          )
          // if (ret) console.log('?', item, newItem)
          return ret;
        });
        // console.log('isChanged', isChanged)
        if (!isChanged) {
          return node;
        }
      }

      const map = newSpecsData.reduce((acc, cur) => {
        if (!acc[cur.value]) {
          acc[cur.value] = [cur];
        } else {
          acc[cur.value] = acc[cur.value].concat(cur);
        }
        return acc;
      }, {});

      // console.log('map', map);


      const newSpecs = [];

      Object.keys(map).forEach(value => {
        const items = map[value];
        const nonDefaultList = items.filter(item => !item.isDefaultImport && (item.isDefaultImport !== undefined || item.type));
        const defaultList = items.filter(item => item.isDefaultImport || (item.isDefaultImport === undefined && !item.type));
        const namespaceList = items.filter(item => item.type === 'NamespaceImport');
        // console.log('???', value, 'nonDefaultList', nonDefaultList, 'defaultList', defaultList, 'namespaceList', namespaceList, items)
        let importDeclaration;
        // function createImportClause(name: Identifier | undefined, namedBindings: NamedImportBindings | undefined): ImportClause;

        if (namespaceList.length > 0) {
          importDeclaration = ts.createImportDeclaration(
            undefined,
            undefined,
            ts.createImportClause(
              undefined,
              ts.createNamespaceImport(
                ts.createIdentifier(items.localName)
              )
            ),
            ts.createLiteral(value)
          )
        } else {
          const defaultItem = defaultList.length > 0 ? defaultList[0] : undefined;
          const defaultName = defaultItem ? defaultItem.localName : undefined;
          importDeclaration = ts.createImportDeclaration(
            undefined,
            undefined,
            !defaultName && !nonDefaultList.length ? undefined : ts.createImportClause(
              defaultName ? ts.createIdentifier(defaultName) : undefined,
              nonDefaultList.length > 0
                ? ts.createNamedImports(
                  nonDefaultList.map(item => {
                    let ret;
                    if (item.localName && item.localName !== item.importedName) {
                      ret = ts.createImportSpecifier(
                        ts.createIdentifier(item.importedName),
                        ts.createIdentifier(item.localName),
                      );
                    } else {
                      ret = ts.createImportSpecifier(
                        undefined,
                        ts.createIdentifier(item.importedName),
                      );
                    }
                    return ret;
                  })
                )
                : undefined
            ),
            ts.createLiteral(value)
          );
        }
        // console.log('importDeclaration', importDeclaration)
        if (importDeclaration) {
          newSpecs.push(importDeclaration);
        }

      });

      if (newSpecs.length) {
        return newSpecs;
      }
      return node;
    }

    return (node) => ts.visitNode(node, visitor)
  }
  return transformer
}

export default createTransformer

function collectSpecsData(node, prevSpecsData, newSpecsData, options, value) {
  const { customName: nameHook = v => v } = options;
  if (!node.importClause) {
    const option = {
      value: node.moduleSpecifier.text,
      // e.g. import 'react'
      type: 'ImportDeclaration',
    }
    prevSpecsData.push(option);
    customResolveOption(option, nameHook, newSpecsData, value);
    return;
  }

  node.forEachChild((importChild) => {
    if (!ts.isImportClause(importChild)) {
      return
    }
    const { name, namedBindings } = importChild;
    let localName;
    let importedName;
    let isDefaultImport;
    // e.g. import react from 'react'
    let typeName = 'ImportClause';
    if (namedBindings) {
      if (ts.isNamespaceImport(namedBindings)) {
        // e.g. import * as react from 'react'
        typeName = 'NamespaceImport';
      } else if (ts.isNamedImports(namedBindings)) {
        // e.g. import { Component } from 'react'
        typeName = 'NamedImports';
      }
    }

    if (typeName === 'NamespaceImport') {
      // e.g. import * as _ from 'lodash'
      localName = namedBindings.name.text;
      importedName = localName;
      isDefaultImport = true;
    } else if (name) {
      // e.g. import foo from 'x'
      localName = name.text;
      importedName = localName;
      isDefaultImport = true;
    }
    if (typeName === 'NamespaceImport' || name) {
      const option = {
        value,
        importedName,
        name: importedName || localName,
        isDefaultImport,
        type: typeName,
        localName,
      }
      prevSpecsData.push(option);
      customResolveOption(option, nameHook, newSpecsData, value);
    }
    // e.g. import { debounce, isEqual as isDeepEqual } from 'lodash'
    if (typeName === 'NamedImports' && namedBindings) {
      namedBindings.forEachChild((namedBinding) => {
        const importSpecifier = namedBinding;
        let option;
        const typeName = 'ImportSpecifier';
        const isDefaultImport = false;
        let importedName;
        let localName;

        if (!importSpecifier.propertyName) {
          // e.g. import { debounce } from 'lodash'
          importedName = importSpecifier.name.text;
          localName = undefined;
        } else {
          // e.g. import { isEqual as isDeepEqual } from 'lodash'
          localName = importSpecifier.name.text;
          importedName = importSpecifier.propertyName.text;
        }
        option = {
          value,
          importedName,
          name: importedName || localName,
          isDefaultImport,
          type: typeName,
          localName,
        }
        prevSpecsData.push(option);
        customResolveOption(option, nameHook, newSpecsData, value);
      })
    }

  });
}


function customResolveOption(option, nameHook, newSpecsData, value) {
  const coutomConfig = nameHook({ ...option }) || value;
  if (Array.isArray(coutomConfig)) {
    newSpecsData.push(...coutomConfig.filter(v => v));
  } else {
    newSpecsData.push(Object.assign({},
      option,
      typeof coutomConfig === 'object' ? coutomConfig : {
        value: coutomConfig,
      }
    ));
  }
}
