import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const ValidateUuid = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const param = data ? request.params?.[data] : request.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (param && !uuidRegex.test(param)) {
      throw new BadRequestException(`Invalid UUID format: ${param}`);
    }

    return param;
  },
);
