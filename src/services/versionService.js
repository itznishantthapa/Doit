import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// Update these when releasing new versions
export const CURRENT_IOS_VERSION = 1.0;
export const CURRENT_ANDROID_VERSION = 1;

const VERSION_COLLECTION = 'version';
const VERSION_DOC_ID = 'docs4idfordoitok8io';
const APP_URL_COLLECTION = 'appUrl';
const APP_URL_DOC_ID = 'docs4appurlfordoitok8io';

const DEFAULT_STORE_URLS = {
  appstoreUrl: 'https://apps.apple.com/us/app/doit/id6757985105',
  playstoreUrl: 'https://play.google.com/store/apps/details?id=com.blackonedevs.doit',
};

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

    if (!urlDoc.exists()) return DEFAULT_STORE_URLS;

    const data = urlDoc.data();
    return {
      appstoreUrl: data?.appstoreUrl ?? DEFAULT_STORE_URLS.appstoreUrl,
      playstoreUrl: data?.playstoreUrl ?? DEFAULT_STORE_URLS.playstoreUrl,
    };
  } catch (error) {
    if (__DEV__) console.error('Error fetching app store URLs from Firestore:', error);
    return DEFAULT_STORE_URLS;
  }
};
