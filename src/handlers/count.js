import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function count(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { db } = context;

  let count = 0;

  try {
    count = await db.collection('expenses').countDocuments();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(
      'Error while getting expenses count!'
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify(count),
  };
}

export const handler = commonMiddleware(count);
