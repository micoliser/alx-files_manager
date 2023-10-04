/* eslint-disable no-await-in-loop */
import Bull from 'bull';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;
  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');
  const file = await dbClient.verifyFileUser(fileId, userId);
  if (!file) throw new Error('File not found');
  console.log('Processing new job:');
  for (const width of [100, 250, 500]) {
    const thumbnail = imageThumbnail(file.localPath, {
      width,
    });
    console.log('Creating thumbnail');
    const thumbnailName = `${file.localPath}_${width}`;
    console.log(`Created thumbnail in ${thumbnailName}`);
    await fs.writeFile(thumbnailName, thumbnail);
  }
});
