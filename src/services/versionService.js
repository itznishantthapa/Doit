import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// Update these when releasing new versions
export const CURRENT_IOS_VERSION = 1;
export const CURRENT_ANDROID_VERSION = 1;

const VERSION_COLLECTION = 'version';
const VERSION_DOC_ID = 'docs4idfordoitok8io';
const APP_URL_COLLECTION = 'appUrl';
const APP_URL_DOC_ID = 'docs4appurlfordoitok8io';

const getCurrentAppVersion = () =>
  Platform.OS === 'ios' ? CURRENT_IOS_VERSION : CURRENT_ANDROID_VERSION;

export const getRequiredAppVersion = async () => {
  try {
    const db = getFirestore(getApp());
    const versionDoc = await getDoc(doc(db, VERSION_COLLECTION, VERSION_DOC_ID));

    if (!versionDoc.exists()) return null;

    const field = Platform.OS === 'ios' ? 'iosVersion' : 'androidVersion';
    return versionDoc.data()?.[field] ?? null;
  } catch (error) {
    if (__DEV__) console.error('Error fetching app version from Firestore:', error);
    return null;
  }
};

export const checkIfUpdateRequired = async () => {
  try {
    const requiredVersion = await getRequiredAppVersion();
    if (requiredVersion === null) return false;

    return getCurrentAppVersion() < requiredVersion;
  } catch (error) {
    if (__DEV__) console.error('Error checking app version:', error);
    return false;
  }
};

export const getAppStoreUrls = async () => {
  try {
    const db = getFirestore(getApp());
    const urlDoc = await getDoc(doc(db, APP_URL_COLLECTION, APP_URL_DOC_ID));

    if (!urlDoc.exists()) return null;

    const data = urlDoc.data();
    if (!data?.appstoreUrl || !data?.playstoreUrl) return null;

    return {
      appstoreUrl: data.appstoreUrl,
      playstoreUrl: data.playstoreUrl,
    };
  } catch (error) {
    if (__DEV__) console.error('Error fetching app store URLs from Firestore:', error);
    return null;
  }
};
