// // inject-entity-metadata.decorator.ts
// import { ENTITY_KEY } from "./custom-repository.decorator";
//
// export function InjectEntityMetadata(): PropertyDecorator {
//     return function (target: object, propertyKey: string | symbol) {
//         const getter = function (this: any) {
//             const entity = Reflect.getMetadata(ENTITY_KEY, this.constructor);
//             if (!entity) {
//                 throw new Error(`Missing @CustomRepository metadata on ${this.constructor.name}`);
//             }
//             return entity;
//         };
//
//         Object.defineProperty(target, propertyKey, {
//             get: getter,
//             enumerable: true,
//             configurable: true,
//         });
//     };
// }
