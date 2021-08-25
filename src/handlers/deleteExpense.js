import { commonMiddleware } from '../middlewares';
import { ObjectId } from 'mongoDb';

async function deleteExpense(event, context) {
  const { db } = context;

  const {
    pathParameters: { id },
  } = event;

  let _id = null;

  try {
    _id = ObjectId(id);
  } catch (error) {
    console.error(error);

    return {
      statusCode: 400,
      body: 'Invalid expense Id provided!',
    };
  }

  let res = null;

  try {
    res = await db.collection('expenses').deleteOne({ _id });
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: 'Error while deleting Expense!',
    };
  }

  if (!res || !res.acknowledged || res.deletedCount === 0) {
    return {
      statusCode: 404,
      body: 'No expense deleted!',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
}

export const handler = commonMiddleware(deleteExpense);
