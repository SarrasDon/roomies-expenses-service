import createHttpError from 'http-errors';
import { verify } from 'jsonwebtoken';
import { AUTH_SECRET } from '../config';

export default function verifyAccessToken() {
  return {
    before: ({ event, context }) => {
      const { headers } = event;
      const { authorization } = headers;

      const access_token = authorization && authorization.split(' ')[1];
      if (!access_token) {
        throw new createHttpError.Unauthorized('No access token provided!');
      }

      let verificationResult = null;
      try {
        verificationResult = verify(access_token, AUTH_SECRET);
      } catch (error) {
        throw new createHttpError.Unauthorized('Invalid access token');
      }
      if (!verificationResult) {
        throw new createHttpError.Unauthorized('Access token wasnt verified!');
      }

      const { payload: email, sub: userId } = verificationResult;
      context.email = email;
      context.userId = userId;
    }
  };
};