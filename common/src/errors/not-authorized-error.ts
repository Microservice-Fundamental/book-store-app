import { BaseError } from "./base-error";

export class NotAuthorizedError extends BaseError {
    statusCode = 401;
    constructor() {
        super('Not authorized');
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors() {
        return [{ message: 'Not authorized' }];
    }
}
