import { BaseModel } from "./base.model";
import { EntityId } from "@types";
import { Column, DeleteDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class BaseEntity implements BaseModel {
    @PrimaryGeneratedColumn("uuid")
    id: EntityId;

    @Column({ nullable: false, default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ nullable: false, default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deletedAt: Date | null;
}
