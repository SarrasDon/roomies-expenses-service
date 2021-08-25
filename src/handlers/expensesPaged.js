import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function expensesPaged(event, context) {
  const { db } = context;

  const {
    queryStringParameters: { index, limit },
  } = event;

  let expenses = [];
  try {
    expenses = await db
      .collection('expenses')
      .aggregate([{ $sort: { spendAt: -1 } }])
      .skip(Number(index))
      .limit(Number(limit))
      .project({ createdAt: 0, __v: 0 })
      .toArray();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(
      'Error while getting expenses!'
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify(expenses),
  };
}

export const handler = commonMiddleware(expensesPaged);
