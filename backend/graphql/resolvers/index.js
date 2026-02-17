import { merge } from 'lodash-es';
import authResolvers from './authResolvers.js';
import accountResolvers from './accountResolvers.js';
import paymentResolvers from './paymentResolvers.js';
import productResolvers from './productResolvers.js';
import fileResolvers from './fileResolvers.js';

const resolvers = merge(
  authResolvers,
  accountResolvers,
  paymentResolvers,
  productResolvers,
  fileResolvers
);

export default resolvers;
