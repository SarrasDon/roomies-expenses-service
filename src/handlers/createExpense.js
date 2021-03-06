import createHttpError from 'http-errors';
import { ObjectId } from 'mongoDb';
import { commonMiddleware } from '../middlewares';
import { SQS } from 'aws-sdk';
import { EXPENSES_QUEUE_URL } from '../config';

const sqs = new SQS();

async function createExpense(event, context) {
  const { db } = context;
  const { body } = event;

  const { amount, person, reason, spendAt } = body;

  if (!person) {
    throw new createHttpError.BadRequest(`Invalid person provided: ${person}`);
  }

  if (!reason) {
    throw new createHttpError.BadRequest(`Invalid reason provided: ${reason}`);
  }

  const numberAmount = Number(amount);

  if (
    typeof numberAmount !== 'number' ||
    isNaN(numberAmount) ||
    numberAmount <= 0
  ) {
    throw new createHttpError.BadRequest(`Invalid amount provided: ${amount}`);
  }

  let result = null;
  const createdAt = new Date();

  try {
    result = await db.collection('expenses').insertOne({
      amount: numberAmount,
      person: ObjectId(person),
      reason: ObjectId(reason),
      spendAt: new Date(spendAt) || new Date(),
      createdAt,
    });
    if (!result || !result.insertedId) {
      throw new Error('Not valid insert result!');
    }
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(
      'Error while creating expense!'
    );
  }

  try {
    await sqs
      .sendMessage({
        QueueUrl: EXPENSES_QUEUE_URL,
        MessageBody: JSON.stringify({
          action: 'expense-created',
          payload: {
            amount: numberAmount,
            person,
            reason,
            spendAt,
          },
        }),
      })
      .promise();
  } catch (error) {
    console.error(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      _id: result.insertedId,
      amount: numberAmount,
      person,
      reason,
      spendAt: spendAt || new Date(),
      createdAt,
    }),
  };
}

export const handler = commonMiddleware(createExpense);
