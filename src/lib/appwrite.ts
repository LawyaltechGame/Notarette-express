import { Client, Account} from 'appwrite';
import { ENVObj } from './constant';

export const client = new Client();

client
    .setEndpoint(ENVObj.VITE_APPWRITE_ENDPOINT)
    .setProject(ENVObj.VITE_APPWRITE_PROJECT_ID); // Replace with your project ID

export const appwriteAccount = new Account(client);
export {ID} from 'appwrite';