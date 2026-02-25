import config from '../config';
import * as argon2 from 'argon2';

//? Configuration of the hashing
const hashingConfig: argon2.Options & { type: 2 } = {
  type: argon2.argon2id,
  memoryCost: 65536, //! 64mb
  timeCost: 3, //! 3 iteration
  parallelism: 4, //! - cost cpu performance -
};

const withPepper = (password: string): string => `${password}${config.pepper_hashing}`;

//? hash a password method
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(withPepper(password), hashingConfig);
  } catch (error) {
    throw new Error('There was an error hashing the password');
  }
};

//? verify the password
export const verifyPassword = async (
  storedHash: string,
  inputPassword: string
): Promise<boolean> => {
  try {
    return await argon2.verify(storedHash, withPepper(inputPassword));
  } catch (error) {
    console.error('There was an error verifing the password -> ', error);
    return false;
  }
};