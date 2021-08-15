import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares";

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
    typeof numberAmount !== "number" ||
    isNaN(numberAmount) ||
    numberAmount <= 0
  ) {
    throw new createHttpError.BadRequest(`Invalid amount provided: ${amount}`);
  }

  let result = null;
  const createdAt = new Date();

  try {
    result = await db.collection("expenses").insertOne({
      amount: numberAmount,
      person,
      reason,
      spendAt: spendAt || new Date(),
      createdAt,
    });
    if (!result || !result.insertedId) {
      throw new Error("Not valid insert result!");
    }
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(
      "Error while creating expense!"
    );
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
