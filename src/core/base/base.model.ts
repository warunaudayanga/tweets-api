import { EntityId } from "@types";

export interface BaseModel {
    id: EntityId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
