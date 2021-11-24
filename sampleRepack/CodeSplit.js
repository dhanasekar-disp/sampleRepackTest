import React from 'react';
import {StyleSheet, Text, View, Platform} from 'react-native';
import {ChunkManager} from '@callstack/repack/client';

ChunkManager.configure({
  // storage: AsyncStorage,
  resolveRemoteChunk: async () => {
    // console.log('*****CHUNKID', chunkId, parentId);
    let url = 'http://localhost:8082/test.chunk.bundle';
    // let url = 'http://localhost:9000/app1.chunk.bundle';

    return {
      url: `${url}?platform=${Platform.OS}`,
      excludeExtension: true,
    };
  },
});

async function loadComponent(scope, module) {
  await __webpack_init_sharing__('default');
  await ChunkManager.loadChunk(scope, 'test');
  const container = self[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  const exports = factory();
  return exports;
}

const SampleRepackTeacher = React.lazy(
  async () => await loadComponent('sampleRepackTeacher', './App.js'),
);

function AppWrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{textAlign: 'center'}}>Loading...</Text>}>
      <SampleRepackTeacher />
      <Text>hello</Text>
    </React.Suspense>
  );
}

const CodeSplit = () => {
  return (
    <View>
      <Text>sampleRepackTeacher</Text>
      {/* <AppWrapper /> */}
    </View>
  );
};

export default CodeSplit;

const styles = StyleSheet.create({});

// import React, {useEffect} from 'react';
// import {StyleSheet, Text, View} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CodeSplit from './CodeSplit';

// const Host = () => {
//   useEffect(() => {
//     getStorageValue();
//   }, []);

//   const getStorageValue = async () => {};

//   return (
//     <View>
//       <Text>HOST</Text>
//       <CodeSplit />
//     </View>
//   );
// };

// export default Host;

// const styles = StyleSheet.create({});
