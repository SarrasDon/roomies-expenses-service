import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function totals(event, context) {
  const { db } = context;

  let totals = [];
  try {
    totals = await db.collection('expenses')
      .aggregate([
        {
          $group: {
            _id: '$person',
            total: { $sum: '$amount' }
          }
        }
      ])
      .toArray();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError('Error while getting users!');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(totals),
  };
}

export const handler = commonMiddleware(totals);
