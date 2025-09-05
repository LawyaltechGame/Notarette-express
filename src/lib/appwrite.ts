import { Client, Account, Databases, Storage} from 'appwrite';
import { ENVObj } from './constant';

export const client = new Client();

// Provide safe fallbacks so production doesn't crash if env vars are missing
const DEFAULT_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const DEFAULT_PROJECT = '68aea793002c905458d3';

const endpoint = ENVObj.VITE_APPWRITE_ENDPOINT || DEFAULT_ENDPOINT;
const projectId = ENVObj.VITE_APPWRITE_PROJECT_ID || DEFAULT_PROJECT;

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const appwriteAccount = new Account(client);
export {ID} from 'appwrite';
export const databases = new Databases(client);
export const storage = new Storage(client);