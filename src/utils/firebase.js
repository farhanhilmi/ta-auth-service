import axios from 'axios';
import config from '../config/index.js';

export const generateDynamicLink = async (token, userId) => {
    const { data } = await axios.post(config.FIREBASE_DEEP_LINK_URL, {
        dynamicLinkInfo: {
            domainUriPrefix: config.FIREBASE_DEEP_LINK_DOMAIN_URI_PREFIX,
            link: `${config.DEEP_LINK_URL}/${token}/${userId.toString()}`,
            androidInfo: {
                androidPackageName: config.ANDROID_PACKAGE_NAME,
            },
        },
    });
    return data;
};
