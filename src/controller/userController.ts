import ControllerInterface, {
  ControllerRoot,
  ControllerResponse,
  RequestMethodMapper,
} from './../controller/intarface';
import UserInterface, { createUserModel } from '../model/user';
import database, { Database } from '../db';

export default class UserController
  implements ControllerInterface<ControllerResponse>
{
  root: ControllerRoot = '/api/users';
  protected database: Database<UserInterface>;

  constructor() {
    this.database = database as Database<UserInterface>;
  }

  public proceed(
    method: keyof typeof RequestMethodMapper,
    params: string[],
    data: object,
  ): ControllerResponse {
    const operation = RequestMethodMapper[method];
    const handler = this[operation];

    if (handler) {
      try {
        return handler.bind(this)(data, params);
      } catch (err) {
        return {
          code: 400,
          message:
            err instanceof Error
              ? err.message
              : err instanceof String
                ? err
                : (err as string),
        } as ControllerResponse;
      }
    }

    return {
      code: 500,
      message: "Can't resolve the request",
    } as ControllerResponse;
  }

  private _handleGet({}, params: string[] = []): ControllerResponse {
    const user_id = params[0];
    const responce = {
      code: 200,
    } as ControllerResponse;

    if (!user_id) {
      responce.result = this.database.all();
    } else {
      const userData = this.database.get(user_id);
      if (!userData) {
        responce.code = 404;
        responce.message = "User with this ID doesn't exist";
      } else {
        responce.result = userData;
      }
    }
    return responce;
  }
  private _handlePost(data: object): ControllerResponse {
    const model = createUserModel(data);
    const result = this.database.add(model);
    return {
      code: 200,
      message: 'User sucessfully added',
      result,
    } as ControllerResponse;
  }
  private _handlePut(): ControllerResponse {
    return { message: 'not implemented' } as ControllerResponse;
  }
  private _handleDelete(): ControllerResponse {
    return { message: 'not implemented' } as ControllerResponse;
  }
  build(): UserController {
    return new UserController();
  }
}
