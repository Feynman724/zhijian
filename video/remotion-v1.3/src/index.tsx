import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ZhijianDemo} from './video';
const Root: React.FC = () => <Composition id="ZhijianDemo" component={ZhijianDemo} durationInFrames={5400} fps={30} width={1920} height={1080}/>;
registerRoot(Root);
