import { BlobServiceClient } from '@azure/storage-blob';

const storageAccountName = import.meta.env.VITE_STORAGE_ACCOUNT_NAME;
const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-04-30T19:53:22Z&st=2024-04-09T11:53:22Z&spr=https,http&sig=RIuBSg%2B0VwDVo5hefFzzCG3grclNfRAE%2F6BTZoPNWPI%3D";

export const getBlobServiceClient = () => {
    const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net?${sasToken}`
    );
    return blobServiceClient;
};

export async function uploadFile(containerName: string, file: File) {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(`main/${file.name}`);
    
    try {
        const uploadBlobResponse = await blockBlobClient.uploadData(file);
        console.log(`Upload block blob ${file.name} successfully`, uploadBlobResponse.requestId);
        return uploadBlobResponse.requestId; // Or handle differently as needed
    } catch (error) {
        if (error instanceof Error) {
            // Now 'error' is typed as Error, and you can access the 'message' property
            console.error('Upload failed:', error.message);
        } else {
            // Handle cases where the error is not an Error object
            console.error('Upload failed:', error);
        }
        throw error;
    }
}
