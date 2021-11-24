import * as React from 'react';
import {AppRegistry, Text, Platform, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ChunkManager} from '@callstack/repack/client';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Host from './Host';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

ChunkManager.configure({
  storage: AsyncStorage,
  forceRemoteChunkResolution: true,
  resolveRemoteChunk: async (chunkId, parentId) => {
    console.log('ChunkID, ParentID', chunkId, parentId);
    let url;
    switch (parentId) {
      case 'sampleRepackTeacher':
        url = `http://localhost:8082/${chunkId}.chunk.bundle`;
        break;
      case 'sampleRepackStudent':
        url = `http://localhost:8083/${chunkId}.chunk.bundle`;
        break;
      case 'main':
      default:
        url =
          {
            // containers
            sampleRepackTeacher:
              'http://localhost:8082/sampleRepackTeacher.container.bundle',
            sampleRepackStudent:
              'http://localhost:8083/sampleRepackStudent.container.bundle',
          }[chunkId] ?? `http://localhost:8081/${chunkId}.chunk.bundle`;
        break;
    }
    console.log(`${url}?platform=${Platform.OS}`);
    return {
      url: `${url}?platform=${Platform.OS}`,
      excludeExtension: true,
    };
  },
});

async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  // Download and execute container
  await ChunkManager.loadChunk(scope, 'main');

  const container = self[scope];

  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  const exports = factory();
  return exports;
}

const App1 = React.lazy(() => loadComponent('sampleRepackTeacher', './App.js'));

const App2 = React.lazy(() => loadComponent('sampleRepackStudent', './App.js'));

function App1Wrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{textAlign: 'center'}}>Loading App1...</Text>}>
      <App1
      // navigationHost={navigation}
      // routeHost={route}
      // createNativeStackNavigator={createNativeStackNavigator}
      // Stack={Stack}
      />
    </React.Suspense>
  );
}

function App2Wrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{textAlign: 'center'}}>Loading App2...</Text>}>
      <App2
      // navigationHost={navigation}
      // routeHost={route}
      // createNativeStackNavigator={createNativeStackNavigator}
      // Stack={Stack}
      />
    </React.Suspense>
  );
}

const Tab = createBottomTabNavigator();

export function Root() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Host">
        <Tab.Screen name="Host" component={Host} />
        <Tab.Screen name="sampleRepackTeacher" component={App1Wrapper} />
        <Tab.Screen name="sampleRepackStudent" component={App2Wrapper} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
