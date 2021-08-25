import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares";
import { ObjectId } from "mongoDb";

async function deleteExpense(event, context) {
  const { db } = context;

  const {
    pathParameters: { id },
  } = event;

  let res = null;

  try {
    res = await db.collection("expenses").deleteOne({ _id: ObjectId(id) });
  } catch (error) {
    console.error(error);

    throw new createHttpError.InternalServerError(
      "Error while deleting expense!"
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
}

export const handler = commonMiddleware(deleteExpense);
