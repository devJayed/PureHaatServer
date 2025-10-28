import jwt, { JwtPayload, Secret,  SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

// export const createToken = (
//     jwtPayload: IJwtPayload,
//     secret: Secret,
//     expiresIn: string, 
// ) => {
//     return jwt.sign(jwtPayload, secret, {
//         expiresIn,
//     });
// };

export const createToken = (
  jwtPayload: IJwtPayload,
  secret: Secret,
  expiresIn: string
) => {
  const options: SignOptions = { expiresIn: expiresIn as any };

  // Explicitly cast payload as object for type safety
  return jwt.sign(jwtPayload as object, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};