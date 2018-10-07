import {nativeImage} from 'electron';
const iconSet = {
  'ready': nativeImage.createFromPath(__dirname + '/../resources/icon.png'),
  'dropAny': nativeImage.createFromPath(__dirname + '/../resources/icon-drop-any.png'),
  'dropImage': nativeImage.createFromPath(__dirname + '/../resources/icon-drop-image.png'),
  'dropText': nativeImage.createFromPath(__dirname + '/../resources/icon-drop-text.png')
};
export default iconSet;
