import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function users(event, context) {
  const { db } = context;

  let users = [];

  try {
    users = await db
      .collection('users')
      .find({})
      .project({ password: 0 })
      .toArray();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError('Error while getting users!');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
}

export const handler = commonMiddleware(users);
