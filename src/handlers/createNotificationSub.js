import createHttpError from 'http-errors';
import { ObjectId } from 'mongoDb';
import { commonMiddleware } from '../middlewares';

async function createNotificationSub(event, context) {
  const { db } = context;
  const { body } = event;

  const { sub, userId } = body;

  let result = null;
  const createdAt = new Date();

  try {
    result = await db.collection('notification-subs').insertOne({
      ...sub,
      userId: ObjectId(userId),
      createdAt,
    });
    if (!result || !result.insertedId) {
      throw new Error('Not valid insert result!');
    }
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError('Error while creating sub!');
  }

  try {
    await db
      .collection('users')
      .updateOne(
        { _id: ObjectId(userId) },
        { $set: { hasEnabledPushNotifications: true } },
        { new: true, upsert: true }
      );
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(
      'Error while updating hasEnabledPushNotifications of user!'
    );
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      _id: result.insertedId,
    }),
  };
}

export const handler = commonMiddleware(createNotificationSub);
