import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function expenseReasons(event, context) {

  const { db } = context;

  let reasons = [];

  try {
    reasons = await db.collection('expensereasons').find({}).toArray();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError('Error while getting expense reasons!');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(reasons),
  };
}

export const handler = commonMiddleware(expenseReasons);


