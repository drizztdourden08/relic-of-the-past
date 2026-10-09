/* @layer renderer-app @kind config */
import { defineProduct } from '@drizztdourden08/brock-core/product';
import config from '../brock.config';

const product = defineProduct(config.product);

export { product };
