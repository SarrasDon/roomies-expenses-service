import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares';

async function expensesMonthly(event, context) {
  const { db } = context;
  const { queryStringParameters: { year, month } } = event;

  let totals = [];
  try {
    const min = new Date(year, month, 1);
    const max = new Date(
      new Date(year, month, 1).setMonth(new Date(year, month, 1).getMonth() + 1)
    );

    totals = await db.collection('expenses')
      .aggregate([
        {
          $match: {
            spendAt: {
              $gte: min,
              $lt: max,
            },
          },
        },
        {
          $group: {
            _id: '$reason',
            total: { $sum: '$amount' },
          },
        },
      ]).toArray();

  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError('Error while getting users!');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(totals),
  };
}

export const handler = commonMiddleware(expensesMonthly);
