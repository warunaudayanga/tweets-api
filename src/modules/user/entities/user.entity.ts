import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../core/base";
import { User } from "../interfaces";
import { Exclude } from "class-transformer";

@Entity("users")
export class UserEntity extends BaseEntity implements User {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @Column({ default: false })
    emailVerified: boolean;
}
