import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const Owner = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params[data] || request.body[data];

    if (!user || !resourceId) {
      throw new ForbiddenException('Acceso denegado');
    }

    return { user, resourceId };
  },
); 