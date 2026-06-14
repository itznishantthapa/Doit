import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const buildFileName = (title, url) => {
  const ext = url?.split('?')[0].match(/\.[a-zA-Z0-9]+$/)?.[0].toLowerCase() ?? '';
  return `${(title ?? 'Assignment').replace(/[\\/:*?"<>|]/g, '_').trim()}${ext}`;
};

const useDownloadAssignment = ({ fileUrl, assignmentTitle }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const download = useCallback(async () => {
    if (!fileUrl || isDownloading || isDownloaded) return;

    const fileName = buildFileName(assignmentTitle, fileUrl);

    setIsDownloading(true);
    try {
      if (Platform.OS === 'android') {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perm.granted) return;

        const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.downloadAsync(fileUrl, tempUri);

        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perm.directoryUri,
          fileName,
          'application/octet-stream',
        );
        const base64 = await FileSystem.readAsStringAsync(tempUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(destUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } else {
        await FileSystem.downloadAsync(
          fileUrl,
          `${FileSystem.documentDirectory}${fileName}`,
        );
      }

      setIsDownloaded(true);
    } catch (err) {
      if (__DEV__) console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [fileUrl, assignmentTitle, isDownloading, isDownloaded]);

  return { download, isDownloading, isDownloaded };
};

export default useDownloadAssignment;
