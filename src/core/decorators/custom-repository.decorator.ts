// // custom-repository.decorator.ts
//
// import { SetMetadata } from "@nestjs/common";
//
// export const ENTITY_KEY = Symbol("ENTITY_KEY");
//
// export function CustomRepository(entity: any): ClassDecorator {
//     return SetMetadata(ENTITY_KEY, entity);
// }
